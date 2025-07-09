-- ===============================================
-- 8단계: 마이그레이션 검증 테스트
-- ===============================================
-- 새로운 Supabase 프로젝트에서 실행할 검증 테스트 스크립트

-- ===============================================
-- 1. 스키마 검증
-- ===============================================

-- 모든 테이블이 존재하는지 확인
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'users', 'children', 'child_guardians', 'activities', 
            'diary_entries', 'milestones', 'growth_records', 'oauth_states'
        ) THEN '✅ Found'
        ELSE '❌ Missing'
    END AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'children', 'child_guardians', 'activities', 
    'diary_entries', 'milestones', 'growth_records', 'oauth_states'
)
ORDER BY table_name;

-- 필수 컬럼 확인
SELECT 
    t.table_name,
    t.column_name,
    t.data_type,
    t.is_nullable,
    t.column_default
FROM information_schema.columns t
WHERE t.table_schema = 'public'
AND t.table_name IN (
    'users', 'children', 'child_guardians', 'activities', 
    'diary_entries', 'milestones', 'growth_records', 'oauth_states'
)
ORDER BY t.table_name, t.ordinal_position;

-- ===============================================
-- 2. 제약 조건 검증
-- ===============================================

-- 기본 키 확인
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY tc.table_name;

-- 외래 키 확인
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- 체크 제약 조건 확인
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name;

-- ===============================================
-- 3. 인덱스 검증
-- ===============================================

-- 인덱스 목록 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ===============================================
-- 4. RLS 정책 검증
-- ===============================================

-- RLS 활성화 상태 확인
SELECT 
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END AS rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- RLS 정책 목록 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===============================================
-- 5. 함수 및 트리거 검증
-- ===============================================

-- 사용자 정의 함수 확인
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 트리거 확인
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===============================================
-- 6. 확장 기능 검증
-- ===============================================

-- 설치된 확장 기능 확인
SELECT 
    e.extname AS extension_name,
    n.nspname AS schema_name,
    e.extversion AS version,
    CASE 
        WHEN e.extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements') THEN '✅ Required'
        ELSE '📦 Optional'
    END AS requirement_status
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
ORDER BY requirement_status DESC, e.extname;

-- ===============================================
-- 7. 데이터 무결성 검증
-- ===============================================

-- 테이블별 레코드 수 확인
SELECT 
    schemaname,
    tablename,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 외래 키 무결성 검증
WITH integrity_checks AS (
    -- users와 children 관계
    SELECT 'children -> users' AS check_name,
           COUNT(*) AS violation_count
    FROM children c
    LEFT JOIN users u ON c.owner_id = u.id
    WHERE u.id IS NULL
    
    UNION ALL
    
    -- child_guardians와 children 관계
    SELECT 'child_guardians -> children' AS check_name,
           COUNT(*) AS violation_count
    FROM child_guardians cg
    LEFT JOIN children c ON cg.child_id = c.id
    WHERE c.id IS NULL
    
    UNION ALL
    
    -- child_guardians와 users 관계
    SELECT 'child_guardians -> users' AS check_name,
           COUNT(*) AS violation_count
    FROM child_guardians cg
    LEFT JOIN users u ON cg.user_id = u.id
    WHERE u.id IS NULL
    
    UNION ALL
    
    -- activities와 children 관계
    SELECT 'activities -> children' AS check_name,
           COUNT(*) AS violation_count
    FROM activities a
    LEFT JOIN children c ON a.child_id = c.id
    WHERE c.id IS NULL
    
    UNION ALL
    
    -- activities와 users 관계
    SELECT 'activities -> users' AS check_name,
           COUNT(*) AS violation_count
    FROM activities a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE u.id IS NULL
)
SELECT 
    check_name,
    violation_count,
    CASE 
        WHEN violation_count = 0 THEN '✅ Valid'
        ELSE '❌ Violations found'
    END AS status
FROM integrity_checks
ORDER BY violation_count DESC, check_name;

-- ===============================================
-- 8. 권한 검증
-- ===============================================

-- 테이블 권한 확인
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND grantee != 'postgres'
ORDER BY table_name, grantee, privilege_type;

-- ===============================================
-- 9. 성능 기준선 측정
-- ===============================================

-- 간단한 쿼리 성능 테스트
EXPLAIN ANALYZE
SELECT COUNT(*) FROM users;

EXPLAIN ANALYZE
SELECT COUNT(*) FROM children;

EXPLAIN ANALYZE
SELECT c.name, u.name as owner_name
FROM children c
JOIN users u ON c.owner_id = u.id
LIMIT 10;

-- ===============================================
-- 10. 기능 테스트
-- ===============================================

-- UUID 생성 기능 테스트
SELECT 
    uuid_generate_v4() AS generated_uuid,
    CASE 
        WHEN uuid_generate_v4() ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' 
        THEN '✅ Valid UUID v4'
        ELSE '❌ Invalid UUID'
    END AS uuid_test;

-- 암호화 기능 테스트
SELECT 
    crypt('test_password', gen_salt('bf')) AS hashed_password,
    crypt('test_password', crypt('test_password', gen_salt('bf'))) = crypt('test_password', gen_salt('bf')) AS crypto_test;

-- 시간대 설정 확인
SELECT 
    name,
    setting,
    CASE 
        WHEN name = 'timezone' AND setting = 'UTC' THEN '✅ Correct'
        WHEN name = 'timezone' THEN '⚠️ Check timezone'
        ELSE '📝 Info'
    END AS status
FROM pg_settings 
WHERE name IN ('timezone', 'log_timezone')
ORDER BY name;

-- ===============================================
-- 11. 종합 상태 리포트
-- ===============================================

WITH migration_status AS (
    SELECT 'Tables' AS component, 
           COUNT(*) AS expected_count,
           COUNT(*) AS actual_count,
           CASE WHEN COUNT(*) = 8 THEN '✅' ELSE '❌' END AS status
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'users', 'children', 'child_guardians', 'activities', 
        'diary_entries', 'milestones', 'growth_records', 'oauth_states'
    )
    
    UNION ALL
    
    SELECT 'RLS Policies' AS component,
           20 AS expected_count, -- 예상 정책 수
           COUNT(*) AS actual_count,
           CASE WHEN COUNT(*) >= 20 THEN '✅' ELSE '❌' END AS status
    FROM pg_policies 
    WHERE schemaname = 'public'
    
    UNION ALL
    
    SELECT 'Functions' AS component,
           4 AS expected_count, -- 예상 함수 수
           COUNT(*) AS actual_count,
           CASE WHEN COUNT(*) >= 4 THEN '✅' ELSE '❌' END AS status
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    
    UNION ALL
    
    SELECT 'Triggers' AS component,
           5 AS expected_count, -- 예상 트리거 수
           COUNT(*) AS actual_count,
           CASE WHEN COUNT(*) >= 5 THEN '✅' ELSE '❌' END AS status
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
)
SELECT 
    component,
    expected_count,
    actual_count,
    status,
    CASE 
        WHEN status = '✅' THEN 'Migration successful'
        ELSE 'Needs attention'
    END AS result
FROM migration_status
ORDER BY 
    CASE WHEN status = '✅' THEN 1 ELSE 0 END,
    component;

-- ===============================================
-- 실행 결과 해석
-- ===============================================

/*
✅ 성공 지표:
- 모든 테이블이 존재함
- RLS가 모든 테이블에서 활성화됨
- 모든 제약 조건이 올바르게 설정됨
- 외래 키 무결성 위반 없음
- 필수 확장 기능이 설치됨

❌ 실패 지표:
- 누락된 테이블이나 컬럼
- RLS 정책 누락
- 외래 키 무결성 위반
- 필수 확장 기능 누락

⚠️ 주의 지표:
- 예상과 다른 레코드 수
- 성능 이슈
- 권한 설정 문제

다음 단계:
1. 실패한 항목들을 수정
2. 애플리케이션 레벨에서 기능 테스트
3. 실제 데이터로 통합 테스트
4. 성능 모니터링 설정
*/