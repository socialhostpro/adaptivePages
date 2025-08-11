# Database Documentation

This document provides a comprehensive overview of the database schema, conventions, and operational procedures for the AdaptivePages application.

## Technology

-   **Database:** [PostgreSQL](https://www.postgresql.org/)
-   **Provider:** [Supabase](https://supabase.com/)
-   **Query Client:** `supabase-js`

Supabase provides the PostgreSQL database, authentication, storage, and auto-generated APIs, which we interact with using the `supabase-js` client library.

## Schema Overview

The database is organized into several tables that manage users, pages, content, and application features. For the complete and authoritative SQL schema, please refer to the script in this document.

### Core Tables

-   **`auth.users`**: Managed by Supabase Auth. Stores user authentication information.
-   **`public.pages`**: The central table of the application. Each row represents a landing page created by a user. It contains core metadata and `JSONB` columns (`data`, `images`) for the page's content and generated assets.
-   **`public.media_files`**: Stores metadata for all user-uploaded files (images, videos, documents) in the Stock/Media Library. The files themselves are stored in Supabase Storage.

### Feature-Specific Tables

-   **E-commerce:** `products`, `product_categories`, `orders`.
-   **CRM:** `contacts`, `forms`.
-   **Bookings:** `bookings`.
-   **Team Management:** `team_members`.
-   **Task Management:** `tasks`.
-   ...and others. See the full SQL script below for a complete list.

## Database Operations (CRUD)

All database interactions are handled through service modules located in `src/services/`. Each service corresponds to a specific domain (e.g., `pageService.ts`, `productService.ts`).

-   **Never query the database directly from a component.** Always go through a service function.
-   Service functions use the `supabase-js` client to perform `select`, `insert`, `update`, and `delete` operations.
-   All functions are `async` and should be called with `await`.
-   Robust error handling is implemented in each service function to catch and log potential database errors.

## Complete Database Setup SQL

You **MUST** run the following SQL script in your Supabase project's SQL Editor for this application to work. This script is safe to run multiple times; it will create tables and columns only if they don't exist and **will not delete any of your existing data.**

Go to your project's SQL Editor: `https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/sql/new`

Then, copy and run the entire script below.

```sql
-- =========== DATABASE & STORAGE SETUP ===========
-- This script is safe to run multiple times. It will create tables and columns if they don't exist,
-- and will not delete any of your existing data.

-- =========== TABLES ===========

-- Pre-requisite: 'contacts' table must exist for the foreign key on 'pages'
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    page_id UUID, -- REFERENCES public.pages(id) ON DELETE CASCADE, -- FK added later
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    email TEXT,
    status TEXT DEFAULT 'Contact',
    source TEXT,
    notes TEXT
);

-- 1. Create 'page_groups' table for organization
CREATE TABLE IF NOT EXISTS public.page_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL
);

-- 2. Create and update the 'pages' table
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
  staff_portal_enabled BOOLEAN,
  group_id UUID REFERENCES public.page_groups(id) ON DELETE SET NULL,
  owner_contact_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL
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
    ADD COLUMN IF NOT EXISTS staff_portal_enabled BOOLEAN,
    ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.page_groups(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS owner_contact_id BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL;

-- 3. Update 'contacts' table (if it was created just now)
ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE;
-- Ensure page_id can be null for contacts not from a specific page
ALTER TABLE public.contacts ALTER COLUMN page_id DROP NOT NULL;


-- 4. Create and update the 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    data JSONB
);

-- 5. Create and update the 'media_files' table
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    keywords TEXT[]
);


-- 6. Create and update 'product_categories' table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    parent_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    position INTEGER NOT NULL DEFAULT 0
);

-- 7. Create and update 'products' table
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

-- 8. Create 'lesson_views' table for analytics
CREATE TABLE IF NOT EXISTS public.lesson_views (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT NOT NULL,
    lesson_title TEXT
);

-- 9. Create 'quiz_attempts' table for analytics
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

-- 10. Create 'bookings' table
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

-- 11. Create 'forms' table for the Form Builder
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    fields JSONB
);

-- 12. Create 'proofing_requests' table and enum
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
    related_entity_type TEXT, -- e.g., 'order', 'page', 'image', 'video'
    related_entity_id TEXT,
    versions JSONB -- To store different versions of proofs
);

-- 13. Create 'proofing_comments' table
CREATE TABLE IF NOT EXISTS public.proofing_comments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    proofing_request_id UUID REFERENCES public.proofing_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    metadata JSONB
);


-- 14. Create 'team_members' table and enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_role') THEN
        CREATE TYPE public.team_role AS ENUM (
            'Admin',
            'Member',
            'Viewer'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- This is the account owner
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role public.team_role NOT NULL DEFAULT 'Member'
);

-- 15. Create 'portals' table
CREATE TABLE IF NOT EXISTS public.portals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Owners', 'Owners Staff', 'Customer'
    page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
    settings JSONB
);

-- 16. Create 'site_components' table
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

-- 17. Create 'seo_reports' table
CREATE TABLE IF NOT EXISTS public.seo_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    score INTEGER NOT NULL,
    report_data JSONB NOT NULL
);

-- 18. Create 'tasks' table and related enums
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


-- 19. Create 'user_profiles' table for settings
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  elevenlabs_api_key TEXT,
  google_api_key TEXT,
  google_build_config JSONB,
  default_custom_domain TEXT,
  twilio_account_sid TEXT,
  twilio_auth_token TEXT,
  twilio_from_number TEXT,
  sendgrid_api_key TEXT,
  sendgrid_from_email TEXT,
  elevenlabs_webhook_url TEXT
);

-- Add new columns to user_profiles if they don't exist
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT,
    ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT,
    ADD COLUMN IF NOT EXISTS twilio_from_number TEXT,
    ADD COLUMN IF NOT EXISTS sendgrid_api_key TEXT,
    ADD COLUMN IF NOT EXISTS sendgrid_from_email TEXT,
    ADD COLUMN IF NOT EXISTS elevenlabs_webhook_url TEXT;

-- 20. Create 'onboarding_wizards' table
CREATE TABLE IF NOT EXISTS public.onboarding_wizards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    steps JSONB NOT NULL
);

-- 21. Create 'onboarding_submissions' table
CREATE TABLE IF NOT EXISTS public.onboarding_submissions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    wizard_id UUID REFERENCES public.onboarding_wizards(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    data JSONB NOT NULL
);


-- =========== ENABLE RLS ===========
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofing_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_wizards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;


-- =========== RLS POLICIES ===========
-- Policies for 'pages' table
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

-- Policies for 'page_groups' table
DROP POLICY IF EXISTS "Allow individual access to page groups" ON public.page_groups;
CREATE POLICY "Allow individual access to page groups" ON public.page_groups FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow public read access to page groups" ON public.page_groups;
CREATE POLICY "Allow public read access to page groups" ON public.page_groups FOR SELECT USING (true);


-- Policies for 'contacts' table
DROP POLICY IF EXISTS "Allow form submission by public" ON public.contacts;
CREATE POLICY "Allow form submission by public" ON public.contacts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owner to manage their contacts" ON public.contacts;
CREATE POLICY "Allow owner to manage their contacts" ON public.contacts FOR ALL USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Allow public read access for contacts" ON public.contacts;
CREATE POLICY "Allow public read access for contacts" ON public.contacts FOR SELECT USING (true);

-- Policies for 'orders' table
DROP POLICY IF EXISTS "Allow order submission by public" ON public.orders;
CREATE POLICY "Allow order submission by public" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owner to read their orders" ON public.orders;
CREATE POLICY "Allow owner to read their orders" ON public.orders FOR SELECT USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Allow owner to update their orders" ON public.orders;
CREATE POLICY "Allow owner to update their orders" ON public.orders FOR UPDATE USING (auth.uid() = owner_id);

-- Policies for 'media_files' table
DROP POLICY IF EXISTS "Allow individual access to media files" ON public.media_files;
CREATE POLICY "Allow individual access to media files" ON public.media_files FOR ALL USING (auth.uid() = user_id);

-- Policies for 'product_categories' table
DROP POLICY IF EXISTS "Allow individual access to product categories" ON public.product_categories;
CREATE POLICY "Allow individual access to product categories" ON public.product_categories FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow public read access for product categories" ON public.product_categories;
CREATE POLICY "Allow public read access for product categories" ON public.product_categories FOR SELECT USING (true);

-- Policies for 'products' table
DROP POLICY IF EXISTS "Allow individual access to products" ON public.products;
CREATE POLICY "Allow individual access to products" ON public.products FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow public read access for products" ON public.products;
CREATE POLICY "Allow public read access for products" ON public.products FOR SELECT USING (true);

-- Policies for 'lesson_views' table
DROP POLICY IF EXISTS "Allow individual access to lesson views" ON public.lesson_views;
CREATE POLICY "Allow individual access to lesson views" ON public.lesson_views FOR ALL USING (auth.uid() = user_id);

-- Policies for 'quiz_attempts' table
DROP POLICY IF EXISTS "Allow individual access to quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Allow individual access to quiz attempts" ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- Policies for 'bookings' table
DROP POLICY IF EXISTS "Allow public insert access" ON public.bookings;
CREATE POLICY "Allow public insert access" ON public.bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owner read access" ON public.bookings;
CREATE POLICY "Allow owner read access" ON public.bookings FOR SELECT USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Allow owner update access" ON public.bookings;
CREATE POLICY "Allow owner update access" ON public.bookings FOR UPDATE USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Allow owner delete access" ON public.bookings;
CREATE POLICY "Allow owner delete access" ON public.bookings FOR DELETE USING (auth.uid() = owner_id);

-- Policies for 'forms' table
DROP POLICY IF EXISTS "Allow individual access to forms" ON public.forms;
CREATE POLICY "Allow individual access to forms" ON public.forms FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow public read access for forms" ON public.forms;
CREATE POLICY "Allow public read access for forms" ON public.forms FOR SELECT USING (true);

-- Policies for 'proofing_requests' table
DROP POLICY IF EXISTS "Allow individual access to proofing requests" ON public.proofing_requests;
CREATE POLICY "Allow individual access to proofing requests" ON public.proofing_requests FOR ALL USING (auth.uid() = user_id);

-- Policies for 'proofing_comments' table
DROP POLICY IF EXISTS "Allow users to manage comments on their proofing requests" ON public.proofing_comments;
CREATE POLICY "Allow users to manage comments on their proofing requests" ON public.proofing_comments
FOR ALL USING (
    proofing_request_id IN (
        SELECT id FROM public.proofing_requests WHERE user_id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Allow public to add comments to any proofing request" ON public.proofing_comments;
CREATE POLICY "Allow public to add comments to any proofing request" ON public.proofing_comments
FOR INSERT WITH CHECK (true);

-- Policies for 'team_members' table
DROP POLICY IF EXISTS "Allow owner to manage team members" ON public.team_members;
CREATE POLICY "Allow owner to manage team members" ON public.team_members FOR ALL USING (auth.uid() = user_id);

-- Policies for 'portals' table
DROP POLICY IF EXISTS "Allow individual access to portals" ON public.portals;
CREATE POLICY "Allow individual access to portals" ON public.portals FOR ALL USING (auth.uid() = user_id);

-- Policies for 'site_components' table
DROP POLICY IF EXISTS "Allow individual access to site components" ON public.site_components;
CREATE POLICY "Allow individual access to site components" ON public.site_components FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow public read access for site components" ON public.site_components;
CREATE POLICY "Allow public read access for site components" ON public.site_components FOR SELECT USING (true);

-- Policies for 'seo_reports' table
DROP POLICY IF EXISTS "Allow individual access to seo reports" ON public.seo_reports;
CREATE POLICY "Allow individual access to seo reports" ON public.seo_reports FOR ALL USING (auth.uid() = user_id);

-- Policies for 'tasks' table
DROP POLICY IF EXISTS "Allow individual access to tasks" ON public.tasks;
CREATE POLICY "Allow individual access to tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- Policies for 'user_profiles' table
DROP POLICY IF EXISTS "Allow individual access to profiles" ON public.user_profiles;
CREATE POLICY "Allow individual access to profiles" ON public.user_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policies for 'onboarding_wizards' table
DROP POLICY IF EXISTS "Allow individual access to onboarding wizards" ON public.onboarding_wizards;
CREATE POLICY "Allow individual access to onboarding wizards" ON public.onboarding_wizards FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow public read access for onboarding wizards" ON public.onboarding_wizards;
CREATE POLICY "Allow public read access for onboarding wizards" ON public.onboarding_wizards FOR SELECT USING (true);


-- Policies for 'onboarding_submissions' table
DROP POLICY IF EXISTS "Allow public submission" ON public.onboarding_submissions;
CREATE POLICY "Allow public submission" ON public.onboarding_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owner to manage submissions" ON public.onboarding_submissions;
CREATE POLICY "Allow owner to manage submissions" ON public.onboarding_submissions FOR ALL USING (auth.uid() = owner_id);


-- =========== TRIGGERS ===========

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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


-- =========== STORAGE ===========

-- Create the 'media_library' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'media_library', 'media_library', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'media_library');

-- Create policies for 'media_library' bucket
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'media_library');

DROP POLICY IF EXISTS "Allow individual insert" ON storage.objects;
CREATE POLICY "Allow individual insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media_library' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Allow individual update" ON storage.objects;
CREATE POLICY "Allow individual update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media_library' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Allow individual delete" ON storage.objects;
CREATE POLICY "Allow individual delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media_library' AND auth.uid()::text = (storage.foldername(name))[1]);
```