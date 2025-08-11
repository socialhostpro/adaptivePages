# SQL Schema: Team Management

This file contains the SQL script for the `team_members` table and related types.

```sql
-- =========== TEAM MANAGEMENT TABLE ===========

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_role') THEN
        CREATE TYPE public.team_role AS ENUM (
            'Admin',
            'Member',
            'Viewer'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- This is the account owner
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role public.team_role NOT NULL DEFAULT 'Member'
);

-- =========== RLS FOR TEAM MANAGEMENT ===========
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner to manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Allow read access on team_members" ON public.team_members;
CREATE POLICY "Allow read access on team_members" ON public.team_members FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert access on team_members" ON public.team_members;
CREATE POLICY "Allow insert access on team_members" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow update access on team_members" ON public.team_members;
CREATE POLICY "Allow update access on team_members" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete access on team_members" ON public.team_members;
CREATE POLICY "Allow delete access on team_members" ON public.team_members FOR DELETE USING (auth.uid() = user_id);
```