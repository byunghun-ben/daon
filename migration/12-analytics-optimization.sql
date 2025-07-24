-- ===============================================
-- 12단계: 분석 및 성능 최적화
-- ===============================================
-- 고급 분석, 인덱스 최적화, 머티리얼라이즈드 뷰를 위한 스크립트

-- 고급 인덱스 생성 (성능 최적화)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_child_type_timestamp 
  ON public.activities(child_id, type, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_jsonb_gin 
  ON public.activities USING gin(data);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_type_timestamp 
  ON public.activities(type, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_diary_entries_child_date 
  ON public.diary_entries(child_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_growth_records_child_recorded 
  ON public.growth_records(child_id, recorded_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_child_achieved 
  ON public.milestones(child_id, achieved_at DESC);

-- 분석용 머티리얼라이즈드 뷰들

-- 일일 수유 패턴 분석 뷰
CREATE MATERIALIZED VIEW mv_daily_feeding_patterns AS
SELECT 
  child_id,
  DATE(timestamp) as date,
  COUNT(*) as feeding_count,
  AVG(CAST(data->>'duration' AS numeric)) as avg_duration_minutes,
  SUM(CASE WHEN data->>'type' = 'breast' THEN 1 ELSE 0 END) as breast_count,
  SUM(CASE WHEN data->>'type' = 'bottle' THEN 1 ELSE 0 END) as bottle_count,
  SUM(CASE WHEN data->>'type' = 'solid' THEN 1 ELSE 0 END) as solid_count,
  AVG(CAST(data->>'amount' AS numeric)) FILTER (WHERE data->>'amount' IS NOT NULL) as avg_amount_ml,
  MIN(timestamp) as first_feeding,
  MAX(timestamp) as last_feeding,
  EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) / 3600 as feeding_span_hours
FROM public.activities 
WHERE type = 'feeding'
  AND timestamp >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY child_id, DATE(timestamp);

-- 일일 수면 패턴 분석 뷰
CREATE MATERIALIZED VIEW mv_daily_sleep_patterns AS
SELECT 
  child_id,
  DATE(timestamp) as date,
  COUNT(*) as sleep_sessions,
  SUM(CAST(data->>'duration' AS numeric)) as total_sleep_minutes,
  AVG(CAST(data->>'duration' AS numeric)) as avg_session_minutes,
  MIN(CAST(data->>'duration' AS numeric)) as min_session_minutes,
  MAX(CAST(data->>'duration' AS numeric)) as max_session_minutes,
  COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 18) as day_naps,
  COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM timestamp) NOT BETWEEN 6 AND 18) as night_sleeps,
  SUM(CAST(data->>'duration' AS numeric)) FILTER (WHERE EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 18) as day_sleep_minutes,
  SUM(CAST(data->>'duration' AS numeric)) FILTER (WHERE EXTRACT(HOUR FROM timestamp) NOT BETWEEN 6 AND 18) as night_sleep_minutes
FROM public.activities 
WHERE type = 'sleep'
  AND timestamp >= CURRENT_DATE - INTERVAL '1 year'
  AND data->>'duration' IS NOT NULL
GROUP BY child_id, DATE(timestamp);

-- 주간 성장 추이 분석 뷰
CREATE MATERIALIZED VIEW mv_weekly_growth_trends AS
SELECT 
  child_id,
  DATE_TRUNC('week', recorded_at)::date as week_start,
  COUNT(*) as record_count,
  AVG(weight) as avg_weight,
  AVG(height) as avg_height,
  AVG(head_circumference) as avg_head_circumference,
  MIN(weight) as min_weight,
  MAX(weight) as max_weight,
  MIN(height) as min_height,
  MAX(height) as max_height,
  STDDEV(weight) as weight_stddev,
  STDDEV(height) as height_stddev,
  -- 성장률 계산 (주간 변화)
  (MAX(weight) - MIN(weight)) as weight_change,
  (MAX(height) - MIN(height)) as height_change,
  MIN(recorded_at) as first_record,
  MAX(recorded_at) as last_record
FROM public.growth_records
WHERE recorded_at >= CURRENT_DATE - INTERVAL '2 years'
  AND (weight IS NOT NULL OR height IS NOT NULL OR head_circumference IS NOT NULL)
GROUP BY child_id, DATE_TRUNC('week', recorded_at);

-- 월간 활동 요약 뷰
CREATE MATERIALIZED VIEW mv_monthly_activity_summary AS
SELECT 
  child_id,
  DATE_TRUNC('month', timestamp)::date as month_start,
  type as activity_type,
  COUNT(*) as activity_count,
  COUNT(DISTINCT DATE(timestamp)) as active_days,
  AVG(CASE 
    WHEN type = 'feeding' AND data->>'duration' IS NOT NULL 
    THEN CAST(data->>'duration' AS numeric) 
  END) as avg_feeding_duration,
  AVG(CASE 
    WHEN type = 'sleep' AND data->>'duration' IS NOT NULL 
    THEN CAST(data->>'duration' AS numeric) 
  END) as avg_sleep_duration,
  COUNT(*) FILTER (WHERE data->>'type' = 'wet') as wet_diapers,
  COUNT(*) FILTER (WHERE data->>'type' = 'dirty') as dirty_diapers,
  COUNT(*) FILTER (WHERE data->>'type' = 'both') as both_diapers
FROM public.activities
WHERE timestamp >= CURRENT_DATE - INTERVAL '2 years'
GROUP BY child_id, DATE_TRUNC('month', timestamp), type;

-- 머티리얼라이즈드 뷰 인덱스 생성
CREATE INDEX idx_mv_daily_feeding_child_date ON mv_daily_feeding_patterns(child_id, date DESC);
CREATE INDEX idx_mv_daily_sleep_child_date ON mv_daily_sleep_patterns(child_id, date DESC);
CREATE INDEX idx_mv_weekly_growth_child_week ON mv_weekly_growth_trends(child_id, week_start DESC);
CREATE INDEX idx_mv_monthly_summary_child_month ON mv_monthly_activity_summary(child_id, month_start DESC);

-- 분석 결과 캐시 테이블
CREATE TABLE public.analytics_cache (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  cache_key text NOT NULL,
  child_id uuid REFERENCES public.children(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  analysis_type text NOT NULL, -- 'feeding_pattern', 'sleep_analysis', 'growth_trend', etc.
  period_start date NOT NULL,
  period_end date NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cache_key, child_id, analysis_type, period_start, period_end)
);

CREATE INDEX idx_analytics_cache_key ON public.analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON public.analytics_cache(expires_at);
CREATE INDEX idx_analytics_cache_child_type ON public.analytics_cache(child_id, analysis_type);

-- 분석 함수들

-- 수유 패턴 분석 함수
CREATE OR REPLACE FUNCTION analyze_feeding_patterns(
  p_child_id uuid,
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE
) RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  WITH feeding_stats AS (
    SELECT 
      COUNT(*) as total_feedings,
      AVG(feeding_count) as avg_daily_feedings,
      STDDEV(feeding_count) as feeding_consistency,
      AVG(avg_duration_minutes) as avg_duration,
      AVG(feeding_span_hours) as avg_daily_span,
      SUM(breast_count) as total_breast,
      SUM(bottle_count) as total_bottle,
      SUM(solid_count) as total_solid
    FROM mv_daily_feeding_patterns
    WHERE child_id = p_child_id
      AND date BETWEEN p_start_date AND p_end_date
  ),
  hourly_distribution AS (
    SELECT 
      EXTRACT(HOUR FROM timestamp) as hour,
      COUNT(*) as feeding_count
    FROM public.activities
    WHERE child_id = p_child_id 
      AND type = 'feeding'
      AND DATE(timestamp) BETWEEN p_start_date AND p_end_date
    GROUP BY EXTRACT(HOUR FROM timestamp)
    ORDER BY hour
  )
  SELECT jsonb_build_object(
    'period', jsonb_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date,
      'days', p_end_date - p_start_date + 1
    ),
    'summary', row_to_json(fs)::jsonb,
    'hourly_distribution', jsonb_agg(
      jsonb_build_object('hour', hd.hour, 'count', hd.feeding_count)
    ),
    'feeding_type_ratio', jsonb_build_object(
      'breast_pct', ROUND((fs.total_breast::numeric / NULLIF(fs.total_feedings, 0)) * 100, 1),
      'bottle_pct', ROUND((fs.total_bottle::numeric / NULLIF(fs.total_feedings, 0)) * 100, 1),
      'solid_pct', ROUND((fs.total_solid::numeric / NULLIF(fs.total_feedings, 0)) * 100, 1)
    )
  ) INTO result
  FROM feeding_stats fs, hourly_distribution hd
  GROUP BY row_to_json(fs)::jsonb;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 수면 패턴 분석 함수
CREATE OR REPLACE FUNCTION analyze_sleep_patterns(
  p_child_id uuid,
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE
) RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  WITH sleep_stats AS (
    SELECT 
      COUNT(*) as total_days,
      AVG(total_sleep_minutes) as avg_daily_sleep,
      AVG(sleep_sessions) as avg_sessions_per_day,
      AVG(day_sleep_minutes) as avg_day_sleep,
      AVG(night_sleep_minutes) as avg_night_sleep,
      AVG(day_naps) as avg_day_naps,
      STDDEV(total_sleep_minutes) as sleep_consistency
    FROM mv_daily_sleep_patterns
    WHERE child_id = p_child_id
      AND date BETWEEN p_start_date AND p_end_date
  ),
  sleep_quality_trend AS (
    SELECT 
      date,
      total_sleep_minutes,
      sleep_sessions,
      CASE 
        WHEN total_sleep_minutes >= 600 THEN 'good' -- 10+ hours
        WHEN total_sleep_minutes >= 480 THEN 'fair' -- 8-10 hours
        ELSE 'poor' -- less than 8 hours
      END as quality_rating
    FROM mv_daily_sleep_patterns
    WHERE child_id = p_child_id
      AND date BETWEEN p_start_date AND p_end_date
    ORDER BY date
  )
  SELECT jsonb_build_object(
    'period', jsonb_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date,
      'days', p_end_date - p_start_date + 1
    ),
    'summary', row_to_json(ss)::jsonb,
    'daily_trends', jsonb_agg(
      jsonb_build_object(
        'date', sqt.date,
        'total_minutes', sqt.total_sleep_minutes,
        'sessions', sqt.sleep_sessions,
        'quality', sqt.quality_rating
      ) ORDER BY sqt.date
    ),
    'quality_distribution', (
      SELECT jsonb_object_agg(quality_rating, count)
      FROM (
        SELECT quality_rating, COUNT(*) as count
        FROM sleep_quality_trend
        GROUP BY quality_rating
      ) q
    )
  ) INTO result
  FROM sleep_stats ss, sleep_quality_trend sqt
  GROUP BY row_to_json(ss)::jsonb;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 머티리얼라이즈드 뷰 새로고침 함수
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_feeding_patterns;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sleep_patterns;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weekly_growth_trends;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_activity_summary;
  
  -- 만료된 캐시 정리
  DELETE FROM public.analytics_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 분석 뷰 자동 새로고침 설정 (매일 새벽 3시)
-- 이 부분은 실제 운영 환경에서 cron job이나 PgAgent로 설정
COMMENT ON FUNCTION refresh_analytics_views IS '분석용 머티리얼라이즈드 뷰 새로고침 - 매일 자동 실행 권장';

-- 캐시 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.analytics_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 코멘트 추가
COMMENT ON MATERIALIZED VIEW mv_daily_feeding_patterns IS '일일 수유 패턴 분석 뷰 - 수유 횟수, 지속시간, 유형별 통계';
COMMENT ON MATERIALIZED VIEW mv_daily_sleep_patterns IS '일일 수면 패턴 분석 뷰 - 수면 시간, 세션, 낮잠/밤잠 구분';
COMMENT ON MATERIALIZED VIEW mv_weekly_growth_trends IS '주간 성장 추이 분석 뷰 - 체중/키 변화 및 성장률';
COMMENT ON MATERIALIZED VIEW mv_monthly_activity_summary IS '월간 활동 요약 뷰 - 활동별 횟수 및 패턴';

COMMENT ON TABLE public.analytics_cache IS '분석 결과 캐시 테이블 - 복잡한 분석 결과를 캐싱하여 성능 향상';

COMMENT ON FUNCTION analyze_feeding_patterns IS '수유 패턴 분석 함수 - 지정 기간의 수유 패턴, 시간대별 분포 분석';
COMMENT ON FUNCTION analyze_sleep_patterns IS '수면 패턴 분석 함수 - 지정 기간의 수면 패턴, 품질 평가 분석';
COMMENT ON FUNCTION cleanup_expired_cache IS '만료된 캐시 정리 함수 - 만료된 분석 캐시 데이터 삭제';