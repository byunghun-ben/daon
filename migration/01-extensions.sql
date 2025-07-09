-- ===============================================
-- 1단계: 필수 확장 기능 설치
-- ===============================================
-- 새로운 Supabase 프로젝트에서 실행할 확장 기능 설치 스크립트

-- UUID 생성 기능 (이미 설치되어 있을 가능성 높음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- 암호화 기능 (이미 설치되어 있을 가능성 높음)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- 쿼리 통계 (이미 설치되어 있을 가능성 높음)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" SCHEMA extensions;

-- GraphQL 지원 (Supabase 기본 제공)
-- CREATE EXTENSION IF NOT EXISTS "pg_graphql" SCHEMA graphql;

-- Vault 확장 (Supabase 기본 제공)
-- CREATE EXTENSION IF NOT EXISTS "supabase_vault" SCHEMA vault;

-- 확장 기능 설치 확인
SELECT 
    e.extname AS extension_name,
    n.nspname AS schema_name,
    e.extversion AS version
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements', 'pg_graphql', 'supabase_vault')
ORDER BY e.extname;