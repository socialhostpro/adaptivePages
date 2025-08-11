# SQL Schema: Proofing

This file contains the SQL script for the `proofing_requests` table and related types.

```sql
-- =========== PROOFING TABLE ===========

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proofing_status') THEN
        CREATE TYPE public.proofing_status AS ENUM (
            'Out for Proof',
            'Response from Client',
            'Approved',
            'Disapproved',
            'Canceled'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.proofing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status public.proofing_status NOT NULL DEFAULT 'Out for Proof',
    client_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL,
    related_entity_type TEXT, -- e.g., 'order', 'page'
    related_entity_id TEXT,
    versions JSONB -- To store different versions of proofs
);

-- =========== RLS FOR PROOFING ===========
ALTER TABLE public.proofing_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow individual access to proofing requests" ON public.proofing_requests;
DROP POLICY IF EXISTS "Allow read access on proofing_requests" ON public.proofing_requests;
CREATE POLICY "Allow read access on proofing_requests" ON public.proofing_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert access on proofing_requests" ON public.proofing_requests;
CREATE POLICY "Allow insert access on proofing_requests" ON public.proofing_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow update access on proofing_requests" ON public.proofing_requests;
CREATE POLICY "Allow update access on proofing_requests" ON public.proofing_requests FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete access on proofing_requests" ON public.proofing_requests;
CREATE POLICY "Allow delete access on proofing_requests" ON public.proofing_requests FOR DELETE USING (auth.uid() = user_id);
```