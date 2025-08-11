# SQL Schema: Course Analytics

This file contains the SQL script for tables related to tracking course progress and analytics.

```sql
-- =========== COURSE ANALYTICS TABLES ===========

-- 1. Create 'lesson_views' table
CREATE TABLE IF NOT EXISTS public.lesson_views (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT NOT NULL,
    lesson_title TEXT
);

-- 2. Create 'quiz_attempts' table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
    chapter_id TEXT NOT NULL,
    quiz_title TEXT,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN NOT NULL
);

-- =========== RLS FOR COURSE ANALYTICS ===========
ALTER TABLE public.lesson_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for 'lesson_views'
DROP POLICY IF EXISTS "Allow individual access to lesson views" ON public.lesson_views;
DROP POLICY IF EXISTS "Allow read access on lesson_views" ON public.lesson_views;
CREATE POLICY "Allow read access on lesson_views" ON public.lesson_views FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert access on lesson_views" ON public.lesson_views;
CREATE POLICY "Allow insert access on lesson_views" ON public.lesson_views FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow update access on lesson_views" ON public.lesson_views;
CREATE POLICY "Allow update access on lesson_views" ON public.lesson_views FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete access on lesson_views" ON public.lesson_views;
CREATE POLICY "Allow delete access on lesson_views" ON public.lesson_views FOR DELETE USING (auth.uid() = user_id);


-- Policies for 'quiz_attempts'
DROP POLICY IF EXISTS "Allow individual access to quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Allow read access on quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Allow read access on quiz_attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert access on quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Allow insert access on quiz_attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow update access on quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Allow update access on quiz_attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete access on quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Allow delete access on quiz_attempts" ON public.quiz_attempts FOR DELETE USING (auth.uid() = user_id);
```