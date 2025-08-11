# SQL Schema: User Settings

This file contains the SQL script for the `user_profiles` table, which stores global user settings like API keys.

```sql
-- =========== USER PROFILES TABLE (for settings) ===========

-- 1. Create 'user_profiles' table
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
  sendgrid_from_email TEXT
);

-- =========== RLS FOR USER PROFILES ===========
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow individual access to profiles" ON public.user_profiles;
CREATE POLICY "Allow individual access to profiles" ON public.user_profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =========== TRIGGERS FOR USER PROFILES ===========

-- 1. Function to create a profile when a new user signs up
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

-- 2. Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

```