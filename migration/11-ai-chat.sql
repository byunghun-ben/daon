-- ===============================================
-- 11단계: AI 채팅 시스템 테이블 생성
-- ===============================================
-- 멀티 AI 채팅 서비스 (OpenAI, Anthropic, Azure)를 위한 테이블들

-- AI 채팅 대화 테이블
CREATE TABLE public.chat_conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text, -- 대화 제목 (자동 생성 또는 사용자 설정)
  messages jsonb NOT NULL DEFAULT '[]', -- 메시지 배열 JSON
  model text NOT NULL, -- 'gpt-4', 'claude-3', 'gpt-3.5-turbo' 등
  provider text CHECK (provider IN ('openai', 'anthropic', 'azure')) NOT NULL,
  total_tokens integer DEFAULT 0, -- 총 사용된 토큰 수
  is_archived boolean DEFAULT false, -- 아카이브 여부
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI 채팅 사용량 추적 테이블 (토큰 및 요청 수 추적)
CREATE TABLE public.chat_usage (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  provider text NOT NULL,
  model text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  cost_usd numeric(10,6) DEFAULT 0, -- 비용 (USD 기준)
  created_at timestamptz DEFAULT now()
);

-- AI 모델 설정 테이블 (모델별 설정 및 가격 정보)
CREATE TABLE public.ai_models (
  id text PRIMARY KEY,
  provider text CHECK (provider IN ('openai', 'anthropic', 'azure')) NOT NULL,
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  max_tokens integer NOT NULL,
  cost_per_1k_prompt numeric(8,6) DEFAULT 0, -- 1000 프롬프트 토큰당 비용 (USD)
  cost_per_1k_completion numeric(8,6) DEFAULT 0, -- 1000 완료 토큰당 비용 (USD)
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI 채팅 템플릿 테이블 (미리 정의된 육아 상담 템플릿)
CREATE TABLE public.chat_templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category text NOT NULL, -- 'feeding', 'sleep', 'development', 'health', 'general'
  title text NOT NULL,
  description text NOT NULL,
  system_prompt text NOT NULL, -- AI에게 전달할 시스템 프롬프트
  user_prompt_template text NOT NULL, -- 사용자 입력 템플릿
  variables jsonb DEFAULT '[]', -- 템플릿 변수들
  is_premium boolean DEFAULT false, -- 프리미엄 전용 템플릿
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);
CREATE INDEX idx_chat_conversations_is_archived ON public.chat_conversations(is_archived);
CREATE INDEX idx_chat_usage_user_id ON public.chat_usage(user_id);
CREATE INDEX idx_chat_usage_created_at ON public.chat_usage(created_at);
CREATE INDEX idx_chat_usage_provider ON public.chat_usage(provider);
CREATE INDEX idx_ai_models_provider ON public.ai_models(provider);
CREATE INDEX idx_ai_models_is_active ON public.ai_models(is_active);
CREATE INDEX idx_chat_templates_category ON public.chat_templates(category);
CREATE INDEX idx_chat_templates_is_active ON public.chat_templates(is_active);

-- 기본 AI 모델 데이터 삽입
INSERT INTO public.ai_models (id, provider, name, display_name, description, max_tokens, cost_per_1k_prompt, cost_per_1k_completion, sort_order) VALUES
-- OpenAI 모델
('gpt-4o', 'openai', 'gpt-4o', 'GPT-4o', '최신 GPT-4 Omni 모델 - 텍스트, 이미지, 오디오 처리 가능', 128000, 0.005, 0.015, 1),
('gpt-4-turbo', 'openai', 'gpt-4-turbo', 'GPT-4 Turbo', '빠르고 효율적인 GPT-4 모델', 128000, 0.01, 0.03, 2),
('gpt-3.5-turbo', 'openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', '경제적이고 빠른 모델', 16385, 0.001, 0.002, 3),

-- Anthropic 모델
('claude-3-5-sonnet', 'anthropic', 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', '뛰어난 추론 능력과 창의성', 200000, 0.003, 0.015, 4),
('claude-3-opus', 'anthropic', 'claude-3-opus-20240229', 'Claude 3 Opus', '최고 성능의 Claude 모델', 200000, 0.015, 0.075, 5),
('claude-3-haiku', 'anthropic', 'claude-3-haiku-20240307', 'Claude 3 Haiku', '빠르고 경제적인 Claude 모델', 200000, 0.00025, 0.00125, 6);

-- 기본 채팅 템플릿 데이터 삽입
INSERT INTO public.chat_templates (category, title, description, system_prompt, user_prompt_template, variables, is_premium) VALUES
('feeding', '수유 상담', '수유 관련 궁금증과 문제 해결', 
 '당신은 전문적인 육아 상담사입니다. 수유 관련 질문에 대해 정확하고 도움이 되는 조언을 제공해주세요. 의학적 응급상황이나 심각한 문제의 경우 전문의 상담을 권하세요.',
 '제 아이는 {{child_age}}개월이고, 수유와 관련해서 다음과 같은 상황입니다: {{user_question}}',
 '["child_age", "user_question"]'::jsonb, false),

('sleep', '수면 패턴 상담', '아이의 수면 문제와 개선 방법 상담',
 '당신은 아동 수면 전문가입니다. 아이의 수면 패턴과 관련된 문제에 대해 과학적 근거를 바탕으로 조언해주세요.',
 '{{child_age}}개월 아이의 수면 패턴이 걱정됩니다: {{sleep_issue}}. 최근 수면 패턴: {{sleep_pattern}}',
 '["child_age", "sleep_issue", "sleep_pattern"]'::jsonb, false),

('development', '발달 상담', '아이의 발달 단계와 마일스톤 상담',
 '당신은 아동 발달 전문가입니다. 아이의 발달 단계와 마일스톤에 대해 정확한 정보와 조언을 제공해주세요.',
 '{{child_age}}개월 아이의 발달과 관련해서 궁금한 점이 있습니다: {{development_question}}',
 '["child_age", "development_question"]'::jsonb, false),

('health', '건강 상담', '일반적인 건강 관련 질문 (응급상황 제외)',
 '당신은 소아 건강 상담사입니다. 일반적인 건강 관련 질문에 답변하되, 심각한 증상이나 응급상황의 경우 즉시 의료진 상담을 권하세요.',
 '{{child_age}}개월 아이의 건강 상태가 걱정됩니다: {{health_concern}}',
 '["child_age", "health_concern"]'::jsonb, true),

('general', '일반 육아 상담', '전반적인 육아 고민과 조언',
 '당신은 경험이 풍부한 육아 상담사입니다. 부모의 다양한 육아 고민에 대해 공감하고 실용적인 조언을 제공해주세요.',
 '육아와 관련해서 다음과 같은 고민이 있습니다: {{parenting_concern}}',
 '["parenting_concern"]'::jsonb, false);

-- AI 채팅 사용량 업데이트 함수
CREATE OR REPLACE FUNCTION update_chat_usage(
  p_user_id uuid,
  p_conversation_id uuid,
  p_provider text,
  p_model text,
  p_prompt_tokens integer,
  p_completion_tokens integer
) RETURNS void AS $$
DECLARE
  model_prompt_cost numeric;
  model_completion_cost numeric;
  total_cost numeric;
BEGIN
  -- 모델별 비용 조회
  SELECT cost_per_1k_prompt, cost_per_1k_completion 
  INTO model_prompt_cost, model_completion_cost
  FROM public.ai_models 
  WHERE id = p_model;
  
  -- 비용 계산 (1000토큰당 비용 * 실제 토큰 수 / 1000)
  total_cost := (model_prompt_cost * p_prompt_tokens / 1000.0) + 
                (model_completion_cost * p_completion_tokens / 1000.0);
  
  -- 사용량 기록
  INSERT INTO public.chat_usage (
    user_id, conversation_id, provider, model,
    prompt_tokens, completion_tokens, total_tokens, cost_usd
  ) VALUES (
    p_user_id, p_conversation_id, p_provider, p_model,
    p_prompt_tokens, p_completion_tokens, 
    p_prompt_tokens + p_completion_tokens, total_cost
  );
  
  -- 대화 총 토큰 수 업데이트
  UPDATE public.chat_conversations 
  SET total_tokens = total_tokens + p_prompt_tokens + p_completion_tokens,
      updated_at = now()
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 월간 AI 채팅 사용량 조회 함수
CREATE OR REPLACE FUNCTION get_monthly_chat_usage(p_user_id uuid)
RETURNS TABLE (
  month_start date,
  total_conversations integer,
  total_messages integer,
  total_tokens integer,
  total_cost_usd numeric,
  by_provider jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_stats AS (
    SELECT 
      date_trunc('month', cu.created_at)::date as month_start,
      COUNT(DISTINCT cu.conversation_id) as conversations,
      COUNT(*) as messages,
      SUM(cu.total_tokens) as tokens,
      SUM(cu.cost_usd) as cost,
      cu.provider
    FROM public.chat_usage cu
    WHERE cu.user_id = p_user_id
      AND cu.created_at >= date_trunc('month', now() - interval '12 months')
    GROUP BY date_trunc('month', cu.created_at), cu.provider
  )
  SELECT 
    ms.month_start,
    SUM(ms.conversations)::integer,
    SUM(ms.messages)::integer,
    SUM(ms.tokens)::integer,
    SUM(ms.cost)::numeric,
    jsonb_object_agg(ms.provider, jsonb_build_object(
      'conversations', ms.conversations,
      'messages', ms.messages,
      'tokens', ms.tokens,
      'cost', ms.cost
    )) as by_provider
  FROM monthly_stats ms
  GROUP BY ms.month_start
  ORDER BY ms.month_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 코멘트 추가
COMMENT ON TABLE public.chat_conversations IS 'AI 채팅 대화 테이블 - 멀티 AI 채팅 서비스 대화 내용 저장';
COMMENT ON TABLE public.chat_usage IS 'AI 채팅 사용량 추적 테이블 - 토큰 사용량 및 비용 추적';
COMMENT ON TABLE public.ai_models IS 'AI 모델 설정 테이블 - 지원하는 AI 모델 및 가격 정보';
COMMENT ON TABLE public.chat_templates IS 'AI 채팅 템플릿 테이블 - 육아 상담용 미리 정의된 템플릿';

COMMENT ON COLUMN public.chat_conversations.messages IS '대화 메시지 JSON 배열 - [{role: "user|assistant", content: "...", timestamp: "..."}]';
COMMENT ON COLUMN public.chat_templates.system_prompt IS 'AI에게 전달할 시스템 프롬프트 - AI의 역할과 행동 방식 정의';
COMMENT ON COLUMN public.chat_templates.variables IS '템플릿에서 사용할 변수 배열 - 사용자 입력으로 대체될 변수들';
COMMENT ON FUNCTION update_chat_usage IS 'AI 채팅 사용량 업데이트 함수 - 토큰 사용량과 비용을 자동 계산하여 기록';
COMMENT ON FUNCTION get_monthly_chat_usage IS '월간 AI 채팅 사용량 조회 함수 - 사용자별 월간 통계 제공';