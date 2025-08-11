# SQL Schema: Bookings

This file contains the SQL script to set up the `bookings` table.

```sql
-- =========== BOOKINGS TABLE ===========

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_info JSONB,
    service_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    service_name TEXT,
    booking_date TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT,
    price NUMERIC(10, 2),
    order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL
);

-- =========== RLS FOR BOOKINGS ===========

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert access" ON public.bookings;
CREATE POLICY "Allow public insert access" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow owner read access" ON public.bookings;
CREATE POLICY "Allow owner read access" ON public.bookings FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Allow owner update access" ON public.bookings;
CREATE POLICY "Allow owner update access" ON public.bookings FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Allow owner delete access" ON public.bookings;
CREATE POLICY "Allow owner delete access" ON public.bookings FOR DELETE USING (auth.uid() = owner_id);
```