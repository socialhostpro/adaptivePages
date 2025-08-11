# SQL Schema: Portals

This file contains the SQL script for the `portals` table.

```sql
-- =========== PORTALS TABLE ===========

CREATE TABLE IF NOT EXISTS public.portals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Owners', 'Owners Staff', 'Customer'
    page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    settings JSONB
);

-- =========== RLS FOR PORTALS ===========
ALTER TABLE public.portals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow individual access to portals" ON public.portals;
CREATE POLICY "Allow individual access to portals" ON public.portals FOR ALL USING (auth.uid() = user_id);
```