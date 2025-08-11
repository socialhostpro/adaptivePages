# SQL Schema: Pages

This file contains the SQL script to set up the `pages` table, which is the core of the application.

```sql
-- =========== PAGES TABLE ===========

-- 1. Create and update the 'pages' table
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  data JSONB,
  images JSONB,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false NOT NULL,
  slug TEXT,
  custom_domain TEXT,
  published_data JSONB,
  published_images JSONB,
  cart_settings JSONB,
  booking_settings JSONB,
  stripe_settings JSONB,
  generation_config JSONB,
  head_scripts TEXT,
  body_scripts TEXT,
  staff_portal_enabled BOOLEAN
);

-- Add unique constraints and new columns separately to avoid errors on table creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_slug_key') THEN
    ALTER TABLE public.pages ADD CONSTRAINT pages_slug_key UNIQUE (slug);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_custom_domain_key') THEN
    ALTER TABLE public.pages ADD CONSTRAINT pages_custom_domain_key UNIQUE (custom_domain);
  END IF;
END;
$$;

ALTER TABLE public.pages
    ADD COLUMN IF NOT EXISTS head_scripts TEXT,
    ADD COLUMN IF NOT EXISTS body_scripts TEXT,
    ADD COLUMN IF NOT EXISTS staff_portal_enabled BOOLEAN;

-- =========== RLS FOR PAGES ===========

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow individual read access" ON public.pages;
CREATE POLICY "Allow individual read access" ON public.pages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read access to published pages" ON public.pages;
CREATE POLICY "Allow public read access to published pages" ON public.pages FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Allow individual insert access" ON public.pages;
CREATE POLICY "Allow individual insert access" ON public.pages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual update access" ON public.pages;
CREATE POLICY "Allow individual update access" ON public.pages FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual delete access" ON public.pages;
CREATE POLICY "Allow individual delete access" ON public.pages FOR DELETE USING (auth.uid() = user_id);
```