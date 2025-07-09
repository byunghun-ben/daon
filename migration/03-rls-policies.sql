-- ===============================================
-- 3단계: RLS (Row Level Security) 정책 설정
-- ===============================================
-- 새로운 Supabase 프로젝트에서 실행할 RLS 정책 설정 스크립트

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- USERS 테이블 정책
-- ===============================================

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 삽입 가능
CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- ===============================================
-- CHILDREN 테이블 정책
-- ===============================================

-- 사용자는 자신이 소유하거나 보호자인 아이들을 조회 가능
CREATE POLICY "Users can view children they have access to" ON public.children
FOR SELECT USING (
    owner_id = auth.uid() 
    OR id IN (
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 자신이 소유하는 아이만 삽입 가능
CREATE POLICY "Users can insert children they own" ON public.children
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- 사용자는 자신이 소유하는 아이만 수정 가능
CREATE POLICY "Users can update children they own" ON public.children
FOR UPDATE USING (owner_id = auth.uid());

-- 사용자는 자신이 소유하는 아이만 삭제 가능
CREATE POLICY "Users can delete children they own" ON public.children
FOR DELETE USING (owner_id = auth.uid());

-- ===============================================
-- CHILD_GUARDIANS 테이블 정책
-- ===============================================

-- 사용자는 자신이 관련된 보호자 관계를 조회 가능
CREATE POLICY "Users can view guardian relationships for their children" ON public.child_guardians
FOR SELECT USING (
    user_id = auth.uid() 
    OR child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
    )
);

-- 아이 소유자는 보호자 초대를 삽입 가능
CREATE POLICY "Child owners can insert guardian invitations" ON public.child_guardians
FOR INSERT WITH CHECK (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
    )
);

-- 아이 소유자는 보호자 관계를 수정 가능
CREATE POLICY "Child owners can update guardian relationships" ON public.child_guardians
FOR UPDATE USING (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
    )
);

-- 초대받은 사용자는 자신의 초대를 수락 가능
CREATE POLICY "Invited users can accept their own invitations" ON public.child_guardians
FOR UPDATE USING (user_id = auth.uid() AND accepted_at IS NULL)
WITH CHECK (user_id = auth.uid());

-- 아이 소유자는 보호자 관계를 삭제 가능
CREATE POLICY "Child owners can delete guardian relationships" ON public.child_guardians
FOR DELETE USING (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
    )
);

-- ===============================================
-- ACTIVITIES 테이블 정책
-- ===============================================

-- 사용자는 접근 권한이 있는 아이의 활동을 조회 가능
CREATE POLICY "Users can view activities for children they have access to" ON public.activities
FOR SELECT USING (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 접근 권한이 있는 아이의 활동을 삽입 가능
CREATE POLICY "Users can insert activities for children they have access to" ON public.activities
FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 자신이 작성한 활동만 수정 가능
CREATE POLICY "Users can update their own activities" ON public.activities
FOR UPDATE USING (user_id = auth.uid());

-- 사용자는 자신이 작성한 활동만 삭제 가능
CREATE POLICY "Users can delete their own activities" ON public.activities
FOR DELETE USING (user_id = auth.uid());

-- ===============================================
-- DIARY_ENTRIES 테이블 정책
-- ===============================================

-- 사용자는 접근 권한이 있는 아이의 일기를 조회 가능
CREATE POLICY "Users can view diary entries for children they have access to" ON public.diary_entries
FOR SELECT USING (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 접근 권한이 있는 아이의 일기를 삽입 가능
CREATE POLICY "Users can insert diary entries for children they have access to" ON public.diary_entries
FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 자신이 작성한 일기만 수정 가능
CREATE POLICY "Users can update their own diary entries" ON public.diary_entries
FOR UPDATE USING (user_id = auth.uid());

-- 사용자는 자신이 작성한 일기만 삭제 가능
CREATE POLICY "Users can delete their own diary entries" ON public.diary_entries
FOR DELETE USING (user_id = auth.uid());

-- ===============================================
-- MILESTONES 테이블 정책
-- ===============================================

-- 사용자는 접근 권한이 있는 아이의 마일스톤을 조회 가능
CREATE POLICY "Users can view milestones for children they have access to" ON public.milestones
FOR SELECT USING (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 접근 권한이 있는 아이의 마일스톤을 삽입 가능
CREATE POLICY "Users can insert milestones for children they have access to" ON public.milestones
FOR INSERT WITH CHECK (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 접근 권한이 있는 아이의 마일스톤을 수정 가능
CREATE POLICY "Users can update milestones for children they have access to" ON public.milestones
FOR UPDATE USING (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 접근 권한이 있는 아이의 마일스톤을 삭제 가능
CREATE POLICY "Users can delete milestones for children they have access to" ON public.milestones
FOR DELETE USING (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- ===============================================
-- GROWTH_RECORDS 테이블 정책
-- ===============================================

-- 사용자는 접근 권한이 있는 아이의 성장 기록을 조회 가능
CREATE POLICY "Users can view growth records for children they have access to" ON public.growth_records
FOR SELECT USING (
    child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 접근 권한이 있는 아이의 성장 기록을 삽입 가능
CREATE POLICY "Users can insert growth records for children they have access to" ON public.growth_records
FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND child_id IN (
        SELECT children.id 
        FROM children 
        WHERE children.owner_id = auth.uid()
        UNION
        SELECT child_guardians.child_id 
        FROM child_guardians 
        WHERE child_guardians.user_id = auth.uid() 
        AND child_guardians.accepted_at IS NOT NULL
    )
);

-- 사용자는 자신이 작성한 성장 기록만 수정 가능
CREATE POLICY "Users can update their own growth records" ON public.growth_records
FOR UPDATE USING (user_id = auth.uid());

-- 사용자는 자신이 작성한 성장 기록만 삭제 가능
CREATE POLICY "Users can delete their own growth records" ON public.growth_records
FOR DELETE USING (user_id = auth.uid());