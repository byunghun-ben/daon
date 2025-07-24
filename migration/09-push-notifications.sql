-- ===============================================
-- 9단계: 푸시 알림 시스템 테이블 생성
-- ===============================================
-- FCM 기반 푸시 알림 시스템을 위한 테이블들

-- FCM 토큰 테이블 (사용자별 디바이스 토큰 관리)
CREATE TABLE public.fcm_tokens (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  platform text CHECK (platform IN ('ios', 'android', 'web')),
  device_info jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

-- 알림 설정 테이블 (사용자별 알림 환경설정)
CREATE TABLE public.notification_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('feeding', 'sleep', 'diaper', 'growth', 'milestone', 'summary', 'reminder')),
  enabled boolean DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  sound_enabled boolean DEFAULT true,
  vibration_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

-- 알림 이력 테이블 (발송된 알림들의 추적)
CREATE TABLE public.notification_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  fcm_token_id uuid REFERENCES public.fcm_tokens(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'clicked')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- 예약 알림 테이블 (스케줄링된 알림)
CREATE TABLE public.scheduled_notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  scheduled_for timestamptz NOT NULL,
  repeat_interval text CHECK (repeat_interval IN ('none', 'daily', 'weekly', 'monthly')),
  repeat_days integer[], -- 요일 (0=일요일, 6=토요일)
  is_active boolean DEFAULT true,
  last_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_is_active ON public.fcm_tokens(is_active);
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX idx_notification_history_user_id ON public.notification_history(user_id);
CREATE INDEX idx_notification_history_sent_at ON public.notification_history(sent_at);
CREATE INDEX idx_scheduled_notifications_user_id ON public.scheduled_notifications(user_id);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_is_active ON public.scheduled_notifications(is_active);

-- 기본 알림 설정 데이터 삽입 함수
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- 새 사용자에게 기본 알림 설정 생성
  INSERT INTO public.notification_settings (user_id, category, enabled)
  VALUES 
    (NEW.id, 'feeding', true),
    (NEW.id, 'sleep', true),
    (NEW.id, 'diaper', true),
    (NEW.id, 'growth', true),
    (NEW.id, 'milestone', true),
    (NEW.id, 'summary', true),
    (NEW.id, 'reminder', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 생성 시 기본 알림 설정 자동 생성 트리거
CREATE TRIGGER tr_create_default_notification_settings
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_settings();

-- 코멘트 추가
COMMENT ON TABLE public.fcm_tokens IS 'FCM 토큰 테이블 - Firebase Cloud Messaging을 위한 디바이스 토큰 관리';
COMMENT ON TABLE public.notification_settings IS '알림 설정 테이블 - 사용자별 카테고리별 알림 환경설정';
COMMENT ON TABLE public.notification_history IS '알림 이력 테이블 - 발송된 모든 알림의 추적 및 상태 관리';
COMMENT ON TABLE public.scheduled_notifications IS '예약 알림 테이블 - 스케줄링된 반복/일회성 알림 관리';

COMMENT ON COLUMN public.notification_settings.quiet_hours_start IS '방해 금지 시작 시간 (HH:MM 형식)';
COMMENT ON COLUMN public.notification_settings.quiet_hours_end IS '방해 금지 종료 시간 (HH:MM 형식)';
COMMENT ON COLUMN public.scheduled_notifications.repeat_days IS '반복 요일 배열 (0=일요일, 1=월요일, ..., 6=토요일)';