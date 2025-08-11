# SQL Schema: Site Components

This file contains the SQL script for the `site_components` table, used by the Component Generator.

```sql
-- =========== SITE COMPONENTS TABLE ===========

CREATE TABLE IF NOT EXISTS public.site_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    section_type TEXT NOT NULL, -- e.g., 'hero', 'features'
    keywords TEXT[],
    tags TEXT[],
    data JSONB NOT NULL -- Stores the actual component data
);

-- =========== RLS FOR SITE COMPONENTS ===========
ALTER TABLE public.site_components ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow individual access to site components" ON public.site_components;
CREATE POLICY "Allow individual access to site components" ON public.site_components FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read access for site components" ON public.site_components;
CREATE POLICY "Allow public read access for site components" ON public.site_components FOR SELECT USING (true);
```