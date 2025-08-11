# SQL Schema: Store (E-commerce)

This file contains the SQL script to set up the tables related to e-commerce functionality, including products, categories, and orders.

```sql
-- =========== STORE TABLES ===========

-- 1. Create 'product_categories' table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    parent_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    position INTEGER NOT NULL DEFAULT 0
);

-- 2. Create 'products' table
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

-- 3. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    data JSONB
);

-- =========== RLS FOR STORE ===========

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for 'product_categories'
DROP POLICY IF EXISTS "Allow individual access to product categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow read access on product_categories" ON public.product_categories;
CREATE POLICY "Allow read access on product_categories" ON public.product_categories FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert access on product_categories" ON public.product_categories;
CREATE POLICY "Allow insert access on product_categories" ON public.product_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow update access on product_categories" ON public.product_categories;
CREATE POLICY "Allow update access on product_categories" ON public.product_categories FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete access on product_categories" ON public.product_categories;
CREATE POLICY "Allow delete access on product_categories" ON public.product_categories FOR DELETE USING (auth.uid() = user_id);


-- Policies for 'products'
DROP POLICY IF EXISTS "Allow individual access to products" ON public.products;
DROP POLICY IF EXISTS "Allow read access on products" ON public.products;
CREATE POLICY "Allow read access on products" ON public.products FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert access on products" ON public.products;
CREATE POLICY "Allow insert access on products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow update access on products" ON public.products;
CREATE POLICY "Allow update access on products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete access on products" ON public.products;
CREATE POLICY "Allow delete access on products" ON public.products FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow public read access for products" ON public.products;
CREATE POLICY "Allow public read access for products" ON public.products FOR SELECT USING (true);

-- Policies for 'orders'
DROP POLICY IF EXISTS "Allow order submission by public" ON public.orders;
CREATE POLICY "Allow order submission by public" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owner to read their orders" ON public.orders;
CREATE POLICY "Allow owner to read their orders" ON public.orders FOR SELECT USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Allow owner to update their orders" ON public.orders;
CREATE POLICY "Allow owner to update their orders" ON public.orders FOR UPDATE USING (auth.uid() = owner_id);

```