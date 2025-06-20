-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Children table policies
CREATE POLICY "Users can view children they have access to" ON public.children
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can insert children they own" ON public.children
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update children they own" ON public.children
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete children they own" ON public.children
  FOR DELETE USING (owner_id = auth.uid());

-- Child guardians table policies
CREATE POLICY "Users can view guardian relationships for their children" ON public.child_guardians
  FOR SELECT USING (
    user_id = auth.uid() OR
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Child owners can insert guardian invitations" ON public.child_guardians
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Child owners can update guardian relationships" ON public.child_guardians
  FOR UPDATE USING (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Invited users can accept their own invitations" ON public.child_guardians
  FOR UPDATE USING (user_id = auth.uid() AND accepted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Child owners can delete guardian relationships" ON public.child_guardians
  FOR DELETE USING (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
    )
  );

-- Activities table policies
CREATE POLICY "Users can view activities for children they have access to" ON public.activities
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can insert activities for children they have access to" ON public.activities
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can update their own activities" ON public.activities
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own activities" ON public.activities
  FOR DELETE USING (user_id = auth.uid());

-- Diary entries table policies
CREATE POLICY "Users can view diary entries for children they have access to" ON public.diary_entries
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can insert diary entries for children they have access to" ON public.diary_entries
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can update their own diary entries" ON public.diary_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own diary entries" ON public.diary_entries
  FOR DELETE USING (user_id = auth.uid());

-- Milestones table policies
CREATE POLICY "Users can view milestones for children they have access to" ON public.milestones
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can insert milestones for children they have access to" ON public.milestones
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can update milestones for children they have access to" ON public.milestones
  FOR UPDATE USING (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can delete milestones for children they have access to" ON public.milestones
  FOR DELETE USING (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

-- Growth records table policies
CREATE POLICY "Users can view growth records for children they have access to" ON public.growth_records
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can insert growth records for children they have access to" ON public.growth_records
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    child_id IN (
      SELECT id FROM public.children WHERE owner_id = auth.uid()
      UNION
      SELECT child_id FROM public.child_guardians 
      WHERE user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can update their own growth records" ON public.growth_records
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own growth records" ON public.growth_records
  FOR DELETE USING (user_id = auth.uid());