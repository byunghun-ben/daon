-- ===============================================
-- 5단계: 데이터 내보내기 스크립트
-- ===============================================
-- 기존 Supabase 프로젝트에서 실행할 데이터 내보내기 스크립트

-- ⚠️ 주의사항:
-- 1. 이 스크립트는 기존 프로젝트에서 실행하여 데이터를 추출하는 용도입니다.
-- 2. 실제 데이터 마이그레이션 시에는 보안을 위해 개인정보를 익명화하거나 제외할 수 있습니다.
-- 3. 파일 저장소(Storage) 데이터는 별도로 마이그레이션해야 합니다.

-- ===============================================
-- 1. 사용자 데이터 내보내기
-- ===============================================

-- 사용자 기본 정보 (개인정보 제외 버전)
SELECT 
    id,
    'user_' || SUBSTR(id::text, 1, 8) || '@example.com' AS email, -- 익명화된 이메일
    'User ' || ROW_NUMBER() OVER (ORDER BY created_at) AS name,   -- 익명화된 이름
    NULL AS avatar_url,  -- 개인정보이므로 제외
    NULL AS phone,       -- 개인정보이므로 제외
    created_at,
    updated_at,
    registration_status,
    oauth_provider,
    oauth_provider_id
FROM public.users
ORDER BY created_at;

-- 사용자 실제 데이터 (개발/테스트용)
-- SELECT * FROM public.users ORDER BY created_at;

-- ===============================================
-- 2. 아이 데이터 내보내기
-- ===============================================

SELECT 
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
FROM public.children
ORDER BY created_at;

-- ===============================================
-- 3. 보호자 관계 데이터 내보내기
-- ===============================================

SELECT 
    id,
    child_id,
    user_id,
    role,
    invited_at,
    accepted_at,
    created_at
FROM public.child_guardians
ORDER BY created_at;

-- ===============================================
-- 4. 활동 데이터 내보내기
-- ===============================================

SELECT 
    id,
    child_id,
    user_id,
    type,
    timestamp,
    data,
    notes,
    created_at,
    updated_at
FROM public.activities
ORDER BY timestamp DESC;

-- ===============================================
-- 5. 일기 데이터 내보내기
-- ===============================================

SELECT 
    id,
    child_id,
    user_id,
    date,
    content,
    photos,
    videos,
    created_at,
    updated_at
FROM public.diary_entries
ORDER BY date DESC;

-- ===============================================
-- 6. 마일스톤 데이터 내보내기
-- ===============================================

SELECT 
    id,
    diary_entry_id,
    child_id,
    type,
    description,
    achieved_at,
    created_at
FROM public.milestones
ORDER BY achieved_at DESC;

-- ===============================================
-- 7. 성장 기록 데이터 내보내기
-- ===============================================

SELECT 
    id,
    child_id,
    user_id,
    recorded_at,
    weight,
    height,
    head_circumference,
    created_at,
    updated_at
FROM public.growth_records
ORDER BY recorded_at DESC;

-- ===============================================
-- 8. OAuth 상태 데이터 내보내기 (선택사항)
-- ===============================================

-- OAuth 상태는 보통 임시 데이터이므로 마이그레이션할 필요 없음
-- SELECT * FROM public.oauth_states WHERE expires_at > NOW();

-- ===============================================
-- 9. 통계 정보 조회
-- ===============================================

-- 테이블별 레코드 수 확인
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

-- ===============================================
-- 10. 데이터 무결성 검증 쿼리
-- ===============================================

-- 고아 레코드 확인 (참조 무결성 검증)
SELECT 'children with invalid owner' AS issue, COUNT(*) AS count
FROM public.children c
LEFT JOIN public.users u ON c.owner_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'activities with invalid child_id' AS issue, COUNT(*) AS count
FROM public.activities a
LEFT JOIN public.children c ON a.child_id = c.id
WHERE c.id IS NULL

UNION ALL

SELECT 'activities with invalid user_id' AS issue, COUNT(*) AS count
FROM public.activities a
LEFT JOIN public.users u ON a.user_id = u.id
WHERE u.id IS NULL;

-- ===============================================
-- 실행 가이드
-- ===============================================

/*
1. 위 쿼리들을 순서대로 실행하여 데이터를 확인/내보내기
2. 결과를 CSV나 JSON 형태로 저장
3. 개인정보 보호가 필요한 경우 익명화된 버전 사용
4. 새 프로젝트에서 06-data-import.sql을 사용하여 데이터 가져오기

CSV 내보내기 예시 (Supabase Dashboard에서):
- SQL Editor에서 쿼리 실행 후 "Download CSV" 버튼 클릭
- 또는 psql 명령어 사용:
  \copy (SELECT * FROM public.users) TO 'users.csv' WITH CSV HEADER;
*/