-- ===============================================
-- 2단계: 테이블 스키마 생성
-- ===============================================
-- 새로운 Supabase 프로젝트에서 실행할 스키마 생성 스크립트

-- 사용자 테이블
CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    name text,
    avatar_url text,
    phone text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    registration_status text NOT NULL DEFAULT 'incomplete'::text,
    oauth_provider text,
    oauth_provider_id text,
    
    -- 제약 조건
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_registration_status_check CHECK (registration_status = ANY (ARRAY['incomplete'::text, 'completed'::text])),
    CONSTRAINT users_oauth_provider_check CHECK (oauth_provider IS NULL OR (oauth_provider = ANY (ARRAY['kakao'::text, 'google'::text, 'apple'::text, 'facebook'::text]))),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 아이 테이블
CREATE TABLE public.children (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    birth_date date NOT NULL,
    gender text,
    photo_url text,
    birth_weight numeric,
    birth_height numeric,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    invite_code text,
    
    -- 제약 조건
    CONSTRAINT children_pkey PRIMARY KEY (id),
    CONSTRAINT children_invite_code_key UNIQUE (invite_code),
    CONSTRAINT children_gender_check CHECK (gender = ANY (ARRAY['male'::text, 'female'::text])),
    CONSTRAINT children_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);

-- 아이-보호자 관계 테이블
CREATE TABLE public.child_guardians (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    child_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'guardian'::text,
    invited_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    accepted_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- 제약 조건
    CONSTRAINT child_guardians_pkey PRIMARY KEY (id),
    CONSTRAINT child_guardians_role_check CHECK (role = ANY (ARRAY['owner'::text, 'guardian'::text, 'viewer'::text])),
    CONSTRAINT child_guardians_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
    CONSTRAINT child_guardians_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 활동 테이블
CREATE TABLE public.activities (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    child_id uuid NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    data jsonb NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- 제약 조건
    CONSTRAINT activities_pkey PRIMARY KEY (id),
    CONSTRAINT activities_type_check CHECK (type = ANY (ARRAY['feeding'::text, 'diaper'::text, 'sleep'::text, 'tummy_time'::text, 'custom'::text])),
    CONSTRAINT activities_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
    CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 일기 엔트리 테이블
CREATE TABLE public.diary_entries (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    child_id uuid NOT NULL,
    user_id uuid NOT NULL,
    date date NOT NULL,
    content text NOT NULL,
    photos text[],
    videos text[],
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- 제약 조건
    CONSTRAINT diary_entries_pkey PRIMARY KEY (id),
    CONSTRAINT diary_entries_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
    CONSTRAINT diary_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 마일스톤 테이블
CREATE TABLE public.milestones (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    diary_entry_id uuid,
    child_id uuid NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    achieved_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- 제약 조건
    CONSTRAINT milestones_pkey PRIMARY KEY (id),
    CONSTRAINT milestones_type_check CHECK (type = ANY (ARRAY['first_smile'::text, 'first_step'::text, 'first_word'::text, 'custom'::text])),
    CONSTRAINT milestones_diary_entry_id_fkey FOREIGN KEY (diary_entry_id) REFERENCES public.diary_entries(id),
    CONSTRAINT milestones_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id)
);

-- 성장 기록 테이블
CREATE TABLE public.growth_records (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    child_id uuid NOT NULL,
    user_id uuid NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    weight numeric,
    height numeric,
    head_circumference numeric,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- 제약 조건
    CONSTRAINT growth_records_pkey PRIMARY KEY (id),
    CONSTRAINT growth_records_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
    CONSTRAINT growth_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- OAuth 상태 테이블
CREATE TABLE public.oauth_states (
    state character varying NOT NULL,
    provider character varying NOT NULL DEFAULT 'kakao'::character varying,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    
    -- 제약 조건
    CONSTRAINT oauth_states_pkey PRIMARY KEY (state)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_children_owner_id ON public.children(owner_id);
CREATE INDEX IF NOT EXISTS idx_child_guardians_child_id ON public.child_guardians(child_id);
CREATE INDEX IF NOT EXISTS idx_child_guardians_user_id ON public.child_guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_child_id ON public.activities(child_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON public.activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_diary_entries_child_id ON public.diary_entries(child_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON public.diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_milestones_child_id ON public.milestones(child_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_child_id ON public.growth_records(child_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_recorded_at ON public.growth_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON public.oauth_states(expires_at);

-- 코멘트 추가
COMMENT ON COLUMN public.children.gender IS 'Child gender - nullable for cases where gender is not yet determined (e.g., during pregnancy or when parents prefer not to specify)';
COMMENT ON COLUMN public.users.oauth_provider IS 'OAuth provider name (kakao, google, apple, etc.). NULL for email/password accounts.';
COMMENT ON COLUMN public.users.oauth_provider_id IS 'Unique user ID from OAuth provider. NULL for email/password accounts.';