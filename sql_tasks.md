# SQL Schema: Task Management

This file contains the SQL script for the `tasks` table and related types and policies, which were previously part of the application.

```sql
-- =========== TASK MANAGEMENT TABLES AND TYPES ===========

-- 1. Create enums for task status and priority
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE public.task_status AS ENUM (
            'To-Do',
            'In Progress',
            'Done',
            'On Hold'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE public.task_priority AS ENUM (
            'Low',
            'Medium',
            'High'
        );
    END IF;
END$$;

-- Add 'On Hold' to task_status enum if it already exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
      ALTER TYPE public.task_status ADD VALUE IF NOT EXISTS 'On Hold';
    END IF;
END$$;


-- 2. Create 'tasks' table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status public.task_status NOT NULL DEFAULT 'To-Do',
    priority public.task_priority NOT NULL DEFAULT 'Medium',
    assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL
);

-- Add task enhancement columns for backwards compatibility
ALTER TABLE public.tasks
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    ADD COLUMN IF NOT EXISTS is_prompt_mode BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS prompt TEXT,
    ADD COLUMN IF NOT EXISTS subtasks JSONB,
    ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS proofing_request_id UUID REFERENCES public.proofing_requests(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS contact_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS seo_report_id UUID REFERENCES public.seo_reports(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS page_group_id UUID REFERENCES public.page_groups(id) ON DELETE SET NULL;


-- =========== RLS FOR TASK MANAGEMENT ===========

-- 3. Enable RLS on the 'tasks' table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for the 'tasks' table
DROP POLICY IF EXISTS "Allow individual access to tasks" ON public.tasks;
CREATE POLICY "Allow individual access to tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- =========== TRIGGERS FOR TASK MANAGEMENT ===========
-- Function to automatically update `updated_at` column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for `tasks` table `updated_at`
DROP TRIGGER IF EXISTS handle_task_update ON public.tasks;
CREATE TRIGGER handle_task_update
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

```