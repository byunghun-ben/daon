-- ===============================================
-- 10단계: 구독 및 수익화 시스템 테이블 생성
-- ===============================================
-- 프리미엄 구독, 사용량 추적, 기능 제한을 위한 테이블들

-- 구독 플랜 테이블 (상품 정의)
CREATE TABLE public.subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL, -- 가격 (소수점 2자리)
  currency text NOT NULL DEFAULT 'KRW',
  interval_type text CHECK (interval_type IN ('month', 'year')) NOT NULL,
  features jsonb NOT NULL, -- 기능 목록 JSON
  limits jsonb NOT NULL, -- 제한사항 JSON (예: max_children: 3, max_guardians: 10)
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 사용자 구독 테이블 (사용자별 구독 상태)
CREATE TABLE public.user_subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id text REFERENCES public.subscription_plans(id) NOT NULL,
  status text CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'unpaid', 'trialing')) NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  trial_start timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  external_subscription_id text, -- Stripe, Apple, Google 구독 ID
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id) -- 사용자당 하나의 활성 구독만 허용
);

-- 구독 사용량 추적 테이블 (리소스별 사용량 모니터링)
CREATE TABLE public.subscription_usage (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  resource_type text NOT NULL, -- 'storage', 'guardians', 'ai_chat', 'export', etc.
  usage_count integer DEFAULT 0,
  limit_count integer NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_type, period_start)
);

-- 프리미엄 기능 테이블 (기능별 제한 정의)
CREATE TABLE public.premium_features (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  feature_type text CHECK (feature_type IN ('limit', 'access', 'quota')) NOT NULL,
  free_limit integer DEFAULT 0, -- 무료 사용자 제한
  premium_limit integer DEFAULT -1, -- 프리미엄 제한 (-1은 무제한)
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 구독 히스토리 테이블 (구독 변경 이력)
CREATE TABLE public.subscription_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  action text CHECK (action IN ('created', 'renewed', 'upgraded', 'downgraded', 'canceled', 'refunded')) NOT NULL,
  old_plan_id text,
  new_plan_id text,
  amount numeric(10,2),
  currency text DEFAULT 'KRW',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_subscription_plans_is_active ON public.subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_sort_order ON public.subscription_plans(sort_order);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end);
CREATE INDEX idx_subscription_usage_user_id ON public.subscription_usage(user_id);
CREATE INDEX idx_subscription_usage_resource_type ON public.subscription_usage(resource_type);
CREATE INDEX idx_subscription_usage_period ON public.subscription_usage(period_start, period_end);
CREATE INDEX idx_premium_features_is_active ON public.premium_features(is_active);
CREATE INDEX idx_subscription_history_user_id ON public.subscription_history(user_id);

-- 기본 구독 플랜 데이터 삽입
INSERT INTO public.subscription_plans (id, name, description, price, interval_type, features, limits) VALUES
('free', '무료', '기본 육아 기록 기능', 0, 'month', 
 '["basic_tracking", "diary", "growth_charts", "2_guardians"]'::jsonb,
 '{"max_children": 2, "max_guardians_per_child": 2, "storage_mb": 100, "ai_chat_per_month": 5}'::jsonb),
('premium', '프리미엄', '모든 기능 + 고급 분석', 4900, 'month',
 '["all_basic_features", "unlimited_guardians", "advanced_analytics", "ai_insights", "export_data", "priority_support"]'::jsonb,
 '{"max_children": -1, "max_guardians_per_child": -1, "storage_mb": 5000, "ai_chat_per_month": 100}'::jsonb),
('family', '패밀리', '대가족을 위한 플랜', 8900, 'month',
 '["all_premium_features", "multiple_families", "shared_dashboard", "advanced_permissions"]'::jsonb,
 '{"max_children": -1, "max_guardians_per_child": -1, "storage_mb": 10000, "ai_chat_per_month": 200}'::jsonb);

-- 기본 프리미엄 기능 정의
INSERT INTO public.premium_features (id, name, description, feature_type, free_limit, premium_limit) VALUES
('max_children', '아이 수', '등록 가능한 아이 수', 'limit', 2, -1),
('max_guardians', '보호자 수', '아이당 초대 가능한 보호자 수', 'limit', 2, -1),
('storage_quota', '저장 공간', '사진/동영상 저장 공간 (MB)', 'quota', 100, 5000),
('ai_chat', 'AI 채팅', '월간 AI 채팅 사용 횟수', 'quota', 5, 100),
('advanced_analytics', '고급 분석', '상세한 패턴 분석 및 인사이트', 'access', 0, 1),
('data_export', '데이터 내보내기', 'PDF/CSV 내보내기 기능', 'access', 0, 1),
('unlimited_photos', '무제한 사진', '사진 업로드 제한 없음', 'access', 0, 1);

-- 사용자별 기본 구독 생성 함수
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- 새 사용자에게 7일 무료 체험 구독 생성
  INSERT INTO public.user_subscriptions (
    user_id, 
    plan_id, 
    status, 
    current_period_start, 
    current_period_end,
    trial_start,
    trial_end
  ) VALUES (
    NEW.id,
    'free',
    'trialing',
    now(),
    now() + interval '7 days',
    now(),
    now() + interval '7 days'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 생성 시 기본 구독 자동 생성 트리거
CREATE TRIGGER tr_create_default_subscription
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- 사용량 체크 함수
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_resource_type text,
  p_increment integer DEFAULT 1
) RETURNS boolean AS $$
DECLARE
  current_usage integer;
  user_limit integer;
  subscription_plan text;
BEGIN
  -- 사용자의 현재 구독 플랜 조회
  SELECT plan_id INTO subscription_plan 
  FROM public.user_subscriptions 
  WHERE user_id = p_user_id AND status IN ('active', 'trialing');
  
  -- 플랜별 제한 조회
  SELECT (limits->>p_resource_type)::integer INTO user_limit
  FROM public.subscription_plans
  WHERE id = COALESCE(subscription_plan, 'free');
  
  -- 무제한인 경우 (-1)
  IF user_limit = -1 THEN
    RETURN true;
  END IF;
  
  -- 현재 사용량 조회
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM public.subscription_usage
  WHERE user_id = p_user_id 
    AND resource_type = p_resource_type
    AND period_start <= now() 
    AND period_end > now();
  
  -- 제한 체크
  RETURN (current_usage + p_increment) <= user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 코멘트 추가
COMMENT ON TABLE public.subscription_plans IS '구독 플랜 정의 테이블 - 무료/프리미엄/패밀리 플랜 관리';
COMMENT ON TABLE public.user_subscriptions IS '사용자 구독 테이블 - 개별 사용자의 구독 상태 및 기간 관리';
COMMENT ON TABLE public.subscription_usage IS '구독 사용량 추적 테이블 - 리소스별 사용량 모니터링';
COMMENT ON TABLE public.premium_features IS '프리미엄 기능 정의 테이블 - 기능별 제한 및 접근 권한';
COMMENT ON TABLE public.subscription_history IS '구독 히스토리 테이블 - 구독 변경 및 결제 이력';

COMMENT ON COLUMN public.subscription_plans.limits IS '플랜별 제한사항 JSON (예: {"max_children": 3, "storage_mb": 1000})';
COMMENT ON COLUMN public.subscription_plans.features IS '플랜별 포함 기능 JSON 배열';
COMMENT ON COLUMN public.user_subscriptions.trial_end IS '무료 체험 종료일 (7일 체험 후 자동 구독)';
COMMENT ON FUNCTION check_usage_limit IS '사용량 제한 체크 함수 - 특정 리소스의 사용량이 제한을 초과하는지 확인';