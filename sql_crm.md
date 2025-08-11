# SQL Schema: CRM (Contacts & Forms)

This file contains the SQL script for the Customer Relationship Management features, including `contacts` and `forms`.

```sql
-- =========== CRM TABLES ===========

-- 1. Create 'contacts' table for CRM
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    email TEXT,
    status TEXT DEFAULT 'Contact',
    source TEXT,
    notes TEXT
);
-- Ensure page_id can be null for contacts not from a specific page
ALTER TABLE public.contacts ALTER COLUMN page_id DROP NOT NULL;

-- 2. Create 'forms' table for the Form Builder
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    fields JSONB
);

-- =========== RLS FOR CRM ===========

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Policies for 'contacts'
DROP POLICY IF EXISTS "Allow form submission by public" ON public.contacts;
CREATE POLICY "Allow form submission by public" ON public.contacts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owner to manage their contacts" ON public.contacts;
CREATE POLICY "Allow owner to manage their contacts" ON public.contacts FOR ALL USING (auth.uid() = owner_id);

-- Policies for 'forms'
DROP POLICY IF EXISTS "Allow individual access to forms" ON public.forms;
DROP POLICY IF EXISTS "Allow read access on forms" ON public.forms;
CREATE POLICY "Allow read access on forms" ON public.forms FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert access on forms" ON public.forms;
CREATE POLICY "Allow insert access on forms" ON public.forms FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow update access on forms" ON public.forms;
CREATE POLICY "Allow update access on forms" ON public.forms FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete access on forms" ON public.forms;
CREATE POLICY "Allow delete access on forms" ON public.forms FOR DELETE USING (auth.uid() = user_id);
```