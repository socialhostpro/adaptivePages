-- =========== BOOKING SYSTEM SQL SETUP ===========
-- This script contains only the necessary tables and policies for the booking system.
-- It is idempotent and safe to run multiple times.

-- =========== DEPENDENT TABLES ===========

-- 1. Create 'pages' table (dependency for bookings)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT,
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
  generation_config JSONB
);

-- 2. Create 'product_categories' table (dependency for products/services)
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    parent_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    position INTEGER NOT NULL DEFAULT 0
);

-- 3. Create 'products' table (dependency for services used in bookings)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Draft',
    fulfillment_type TEXT NOT NULL DEFAULT 'Shippable',
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    featured_image_url TEXT,
    gallery_images JSONB,
    options JSONB
);

-- 4. Create 'orders' table (dependency for booking invoices)
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    data JSONB
);

-- =========== BOOKINGS TABLE ===========

-- 5. Create 'bookings' table
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


-- =========== ROW LEVEL SECURITY (RLS) FOR BOOKINGS ===========

-- 6. Enable RLS on the 'bookings' table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies for the 'bookings' table
DROP POLICY IF EXISTS "Allow public insert access" ON public.bookings;
CREATE POLICY "Allow public insert access" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow owner read access" ON public.bookings;
CREATE POLICY "Allow owner read access" ON public.bookings FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Allow owner update access" ON public.bookings;
CREATE POLICY "Allow owner update access" ON public.bookings FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Allow owner delete access" ON public.bookings;
CREATE POLICY "Allow owner delete access" ON public.bookings FOR DELETE USING (auth.uid() = owner_id);
