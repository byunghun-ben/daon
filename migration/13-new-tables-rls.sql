-- ===============================================
-- 13단계: 새로 추가된 테이블들의 RLS 정책
-- ===============================================
-- 푸시 알림, 구독, AI 채팅, 분석 관련 테이블들의 보안 정책

-- =============================================
-- FCM 푸시 알림 관련 RLS 정책
-- =============================================

-- FCM 토큰 RLS 정책
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own FCM tokens" ON public.fcm_tokens
  FOR ALL USING (user_id = auth.uid());

-- 알림 설정 RLS 정책
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification settings" ON public.notification_settings
  FOR ALL USING (user_id = auth.uid());

-- 알림 이력 RLS 정책
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification history" ON public.notification_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert notification history" ON public.notification_history
  FOR INSERT WITH CHECK (true); -- 시스템에서 삽입

-- 예약 알림 RLS 정책
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scheduled notifications" ON public.scheduled_notifications
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- 구독 및 수익화 관련 RLS 정책
-- =============================================

-- 구독 플랜은 모든 사용자가 읽기 가능
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (false); -- 관리자만 접근 (별도 role 기반 정책 필요)

-- 사용자 구독 RLS 정책
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage user subscriptions" ON public.user_subscriptions
  FOR ALL USING (user_id = auth.uid()); -- 결제 시스템에서 업데이트

-- 구독 사용량 RLS 정책
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" ON public.subscription_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage usage tracking" ON public.subscription_usage
  FOR ALL USING (user_id = auth.uid());

-- 프리미엄 기능은 모든 사용자가 읽기 가능
ALTER TABLE public.premium_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view active premium features" ON public.premium_features
  FOR SELECT USING (is_active = true);

-- 구독 히스토리 RLS 정책
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription history" ON public.subscription_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert subscription history" ON public.subscription_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- =============================================
-- AI 채팅 관련 RLS 정책
-- =============================================

-- AI 채팅 대화 RLS 정책
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat conversations" ON public.chat_conversations
  FOR ALL USING (user_id = auth.uid());

-- AI 채팅 사용량 RLS 정책
ALTER TABLE public.chat_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat usage" ON public.chat_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can track chat usage" ON public.chat_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- AI 모델 정보는 모든 사용자가 읽기 가능
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view active AI models" ON public.ai_models
  FOR SELECT USING (is_active = true);

-- AI 채팅 템플릿은 모든 사용자가 읽기 가능
ALTER TABLE public.chat_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view active chat templates" ON public.chat_templates
  FOR SELECT USING (is_active = true);

-- =============================================
-- 분석 관련 RLS 정책
-- =============================================

-- 분석 캐시 RLS 정책
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their children" ON public.analytics_cache
  FOR SELECT USING (
    user_id = auth.uid() OR 
    child_id IN (
      SELECT child_id 
      FROM public.child_guardians 
      WHERE user_id = auth.uid() 
        AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "System can manage analytics cache" ON public.analytics_cache
  FOR ALL USING (
    user_id = auth.uid() OR 
    child_id IN (
      SELECT child_id 
      FROM public.child_guardians 
      WHERE user_id = auth.uid() 
        AND accepted_at IS NOT NULL
    )
  );

-- =============================================
-- 머티리얼라이즈드 뷰 접근 제어 함수
-- =============================================

-- 사용자가 특정 아이의 데이터에 접근할 수 있는지 확인하는 함수
CREATE OR REPLACE FUNCTION user_can_access_child_data(p_child_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.children 
    WHERE id = p_child_id 
      AND owner_id = auth.uid()
    UNION
    SELECT 1 
    FROM public.child_guardians 
    WHERE child_id = p_child_id 
      AND user_id = auth.uid() 
      AND accepted_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자별 구독 상태 확인 함수
CREATE OR REPLACE FUNCTION user_has_premium_access()
RETURNS boolean AS $$
DECLARE
  subscription_status text;
BEGIN
  SELECT status INTO subscription_status
  FROM public.user_subscriptions
  WHERE user_id = auth.uid()
    AND status IN ('active', 'trialing');
  
  RETURN subscription_status IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 특정 프리미엄 기능 접근 권한 확인 함수
CREATE OR REPLACE FUNCTION user_can_access_premium_feature(p_feature_id text)
RETURNS boolean AS $$
DECLARE
  user_subscription text;
  feature_required boolean;
BEGIN
  -- 사용자의 현재 구독 플랜 조회
  SELECT plan_id INTO user_subscription
  FROM public.user_subscriptions
  WHERE user_id = auth.uid()
    AND status IN ('active', 'trialing');
  
  -- 무료 플랜이면 프리미엄 기능 접근 불가
  IF user_subscription = 'free' OR user_subscription IS NULL THEN
    SELECT is_premium INTO feature_required
    FROM public.chat_templates
    WHERE id = p_feature_id;
    
    RETURN NOT COALESCE(feature_required, false);
  END IF;
  
  -- 프리미엄 이상 플랜이면 모든 기능 접근 가능
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 보안 함수들
-- =============================================

-- 알림 설정 검증 함수
CREATE OR REPLACE FUNCTION validate_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- 방해 금지 시간 검증
  IF NEW.quiet_hours_start IS NOT NULL AND NEW.quiet_hours_end IS NOT NULL THEN
    -- 시작 시간과 종료 시간이 같으면 안됨
    IF NEW.quiet_hours_start = NEW.quiet_hours_end THEN
      RAISE EXCEPTION 'Quiet hours start and end time cannot be the same';
    END IF;
  END IF;
  
  -- 사운드와 진동이 모두 비활성화되면 알림도 비활성화
  IF NEW.sound_enabled = false AND NEW.vibration_enabled = false THEN
    NEW.enabled := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 알림 설정 검증 트리거
CREATE TRIGGER tr_validate_notification_settings
  BEFORE INSERT OR UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION validate_notification_settings();

-- 구독 상태 변경 이력 자동 생성 함수
CREATE OR REPLACE FUNCTION log_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태 변경 시에만 이력 생성
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.subscription_history (
      user_id, subscription_id, action, old_plan_id, new_plan_id
    ) VALUES (
      NEW.user_id, NEW.id, 
      CASE NEW.status
        WHEN 'active' THEN 'renewed'
        WHEN 'canceled' THEN 'canceled'
        WHEN 'trialing' THEN 'created'
        ELSE 'updated'
      END,
      OLD.plan_id, NEW.plan_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 구독 변경 이력 트리거
CREATE TRIGGER tr_log_subscription_changes
  AFTER UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_changes();

-- 코멘트 추가
COMMENT ON FUNCTION user_can_access_child_data IS '사용자가 특정 아이의 데이터에 접근할 수 있는지 확인하는 함수';
COMMENT ON FUNCTION user_has_premium_access IS '사용자가 현재 프리미엄 구독을 보유하고 있는지 확인하는 함수';
COMMENT ON FUNCTION user_can_access_premium_feature IS '사용자가 특정 프리미엄 기능에 접근할 수 있는지 확인하는 함수';
COMMENT ON FUNCTION validate_notification_settings IS '알림 설정 데이터의 유효성을 검증하는 함수';
COMMENT ON FUNCTION log_subscription_changes IS '구독 상태 변경 시 자동으로 이력을 생성하는 함수';