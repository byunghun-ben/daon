-- ===============================================
-- 4단계: 함수 및 트리거 설정
-- ===============================================
-- 새로운 Supabase 프로젝트에서 실행할 함수와 트리거 생성 스크립트

-- ===============================================
-- 1. updated_at 자동 업데이트 함수
-- ===============================================

-- updated_at 필드를 자동으로 현재 시간으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 2. 초대 코드 생성 함수
-- ===============================================

-- 아이를 위한 고유한 초대 코드를 생성하는 함수
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text AS $$
DECLARE
    chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result text := '';
    i integer := 0;
    code_length integer := 8;
BEGIN
    -- 8자리 랜덤 코드 생성
    FOR i IN 1..code_length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- 중복 체크
    WHILE EXISTS(SELECT 1 FROM public.children WHERE invite_code = result) LOOP
        result := '';
        FOR i IN 1..code_length LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 3. 아이 생성 시 보호자 관계 자동 생성 함수
-- ===============================================

-- 아이가 생성될 때 소유자를 보호자로 자동 추가하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_child()
RETURNS TRIGGER AS $$
BEGIN
    -- 초대 코드가 없으면 생성
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code = public.generate_invite_code();
    END IF;
    
    -- 아이 생성 후 소유자를 보호자로 추가
    INSERT INTO public.child_guardians (child_id, user_id, role, accepted_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', timezone('utc'::text, now()));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 4. OAuth 상태 정리 함수
-- ===============================================

-- 만료된 OAuth 상태를 정리하는 함수
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
    DELETE FROM public.oauth_states 
    WHERE expires_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 5. 트리거 생성
-- ===============================================

-- users 테이블의 updated_at 자동 업데이트
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- children 테이블의 updated_at 자동 업데이트
CREATE TRIGGER trigger_children_updated_at
    BEFORE UPDATE ON public.children
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- children 테이블 삽입 시 보호자 관계 자동 생성 및 초대 코드 생성
CREATE TRIGGER trigger_children_after_insert
    AFTER INSERT ON public.children
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_child();

-- activities 테이블의 updated_at 자동 업데이트
CREATE TRIGGER trigger_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- diary_entries 테이블의 updated_at 자동 업데이트
CREATE TRIGGER trigger_diary_entries_updated_at
    BEFORE UPDATE ON public.diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- growth_records 테이블의 updated_at 자동 업데이트
CREATE TRIGGER trigger_growth_records_updated_at
    BEFORE UPDATE ON public.growth_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ===============================================
-- 6. 정기 작업 설정 (선택사항)
-- ===============================================

-- pg_cron이 활성화되어 있다면 만료된 OAuth 상태를 매일 정리
-- 주의: Supabase에서 pg_cron은 Enterprise 플랜에서만 사용 가능
-- SELECT cron.schedule(
--     'cleanup-oauth-states',
--     '0 2 * * *', -- 매일 오전 2시 실행
--     'SELECT public.cleanup_expired_oauth_states();'
-- );