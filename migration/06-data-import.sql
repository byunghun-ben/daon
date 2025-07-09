-- ===============================================
-- 6단계: 데이터 가져오기 스크립트
-- ===============================================
-- 새로운 Supabase 프로젝트에서 실행할 데이터 가져오기 스크립트

-- ⚠️ 주의사항:
-- 1. 스키마와 RLS 정책이 먼저 설정되어 있어야 합니다.
-- 2. 트리거가 활성화되어 있으므로 데이터 삽입 시 자동으로 처리됩니다.
-- 3. 외래 키 제약 조건으로 인해 테이블 순서가 중요합니다.

-- ===============================================
-- 1. 데이터 삽입 전 준비
-- ===============================================

-- RLS를 일시적으로 비활성화 (관리자 권한으로 실행 시)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.children DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.child_guardians DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.diary_entries DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.milestones DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.growth_records DISABLE ROW LEVEL SECURITY;

-- 트리거를 일시적으로 비활성화 (필요한 경우)
-- ALTER TABLE public.children DISABLE TRIGGER trigger_children_after_insert;

-- ===============================================
-- 2. 사용자 데이터 삽입
-- ===============================================

-- 예시 사용자 데이터 (실제 데이터로 교체 필요)
INSERT INTO public.users (
    id,
    email,
    name,
    avatar_url,
    phone,
    created_at,
    updated_at,
    registration_status,
    oauth_provider,
    oauth_provider_id
) VALUES
-- 실제 데이터는 05-data-export.sql에서 내보낸 데이터를 사용
-- 예시:
-- ('550e8400-e29b-41d4-a716-446655440000', 'user1@example.com', 'User 1', NULL, NULL, '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', 'completed', NULL, NULL),
-- ('550e8400-e29b-41d4-a716-446655440001', 'user2@example.com', 'User 2', NULL, NULL, '2024-01-02 00:00:00+00', '2024-01-02 00:00:00+00', 'completed', 'kakao', '12345')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 3. 아이 데이터 삽입
-- ===============================================

INSERT INTO public.children (
    id,
    name,
    birth_date,
    gender,
    photo_url,
    birth_weight,
    birth_height,
    owner_id,
    created_at,
    updated_at,
    invite_code
) VALUES
-- 실제 데이터는 05-data-export.sql에서 내보낸 데이터를 사용
-- 예시:
-- ('660e8400-e29b-41d4-a716-446655440000', '아이 1', '2023-01-01', 'male', NULL, 3.2, 50.0, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', 'ABC12345')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 4. 보호자 관계 데이터 삽입
-- ===============================================

-- 주의: children 테이블에 트리거가 있어서 소유자는 자동으로 추가됩니다.
-- 추가 보호자만 삽입하면 됩니다.

INSERT INTO public.child_guardians (
    id,
    child_id,
    user_id,
    role,
    invited_at,
    accepted_at,
    created_at
) VALUES
-- 추가 보호자 관계만 삽입
-- 예시:
-- ('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'guardian', '2024-01-01 00:00:00+00', '2024-01-01 01:00:00+00', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 5. 활동 데이터 삽입
-- ===============================================

INSERT INTO public.activities (
    id,
    child_id,
    user_id,
    type,
    timestamp,
    data,
    notes,
    created_at,
    updated_at
) VALUES
-- 실제 데이터는 05-data-export.sql에서 내보낸 데이터를 사용
-- 예시:
-- ('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'feeding', '2024-01-01 10:00:00+00', '{"type": "breast", "duration": 15}', '잘 먹었음', '2024-01-01 10:00:00+00', '2024-01-01 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 6. 일기 데이터 삽입
-- ===============================================

INSERT INTO public.diary_entries (
    id,
    child_id,
    user_id,
    date,
    content,
    photos,
    videos,
    created_at,
    updated_at
) VALUES
-- 실제 데이터는 05-data-export.sql에서 내보낸 데이터를 사용
-- 예시:
-- ('990e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '2024-01-01', '오늘 첫 웃음을 보였다!', ARRAY['photo1.jpg'], NULL, '2024-01-01 20:00:00+00', '2024-01-01 20:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 7. 마일스톤 데이터 삽입
-- ===============================================

INSERT INTO public.milestones (
    id,
    diary_entry_id,
    child_id,
    type,
    description,
    achieved_at,
    created_at
) VALUES
-- 실제 데이터는 05-data-export.sql에서 내보낸 데이터를 사용
-- 예시:
-- ('aa0e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'first_smile', '첫 웃음', '2024-01-01 15:30:00+00', '2024-01-01 20:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 8. 성장 기록 데이터 삽입
-- ===============================================

INSERT INTO public.growth_records (
    id,
    child_id,
    user_id,
    recorded_at,
    weight,
    height,
    head_circumference,
    created_at,
    updated_at
) VALUES
-- 실제 데이터는 05-data-export.sql에서 내보낸 데이터를 사용
-- 예시:
-- ('bb0e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 00:00:00+00', 3.2, 50.0, 35.0, '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 9. 데이터 삽입 후 정리
-- ===============================================

-- 트리거 다시 활성화 (비활성화했던 경우)
-- ALTER TABLE public.children ENABLE TRIGGER trigger_children_after_insert;

-- RLS 다시 활성화 (비활성화했던 경우)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.child_guardians ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 10. 데이터 무결성 검증
-- ===============================================

-- 삽입된 데이터 확인
SELECT 
    'users' AS table_name, 
    COUNT(*) AS record_count 
FROM public.users
UNION ALL
SELECT 
    'children' AS table_name, 
    COUNT(*) AS record_count 
FROM public.children
UNION ALL
SELECT 
    'child_guardians' AS table_name, 
    COUNT(*) AS record_count 
FROM public.child_guardians
UNION ALL
SELECT 
    'activities' AS table_name, 
    COUNT(*) AS record_count 
FROM public.activities
UNION ALL
SELECT 
    'diary_entries' AS table_name, 
    COUNT(*) AS record_count 
FROM public.diary_entries
UNION ALL
SELECT 
    'milestones' AS table_name, 
    COUNT(*) AS record_count 
FROM public.milestones
UNION ALL
SELECT 
    'growth_records' AS table_name, 
    COUNT(*) AS record_count 
FROM public.growth_records;

-- 외래 키 제약 조건 검증
SELECT 'Valid foreign keys' AS status
WHERE NOT EXISTS (
    SELECT 1 FROM public.children c
    LEFT JOIN public.users u ON c.owner_id = u.id
    WHERE u.id IS NULL
) AND NOT EXISTS (
    SELECT 1 FROM public.child_guardians cg
    LEFT JOIN public.children c ON cg.child_id = c.id
    LEFT JOIN public.users u ON cg.user_id = u.id
    WHERE c.id IS NULL OR u.id IS NULL
) AND NOT EXISTS (
    SELECT 1 FROM public.activities a
    LEFT JOIN public.children c ON a.child_id = c.id
    LEFT JOIN public.users u ON a.user_id = u.id
    WHERE c.id IS NULL OR u.id IS NULL
);

-- ===============================================
-- 실행 가이드
-- ===============================================

/*
1. 먼저 01-extensions.sql ~ 04-functions-triggers.sql을 순서대로 실행
2. 05-data-export.sql로 기존 데이터를 내보내기
3. 내보낸 데이터를 이 스크립트의 INSERT 문에 적용
4. RLS가 활성화되어 있으면 관리자 권한으로 실행하거나 일시적으로 비활성화
5. 데이터 삽입 후 검증 쿼리로 무결성 확인

주의사항:
- auth.users 테이블의 데이터는 Supabase 인증 시스템에서 관리됩니다.
- 실제 사용자 계정은 Supabase Dashboard나 Auth API를 통해 생성해야 합니다.
- public.users 테이블은 auth.users의 확장 정보만 저장합니다.
*/