# SQL Schema: Media & Storage

This file contains the SQL script for the `media_files` table and the Supabase Storage bucket setup.

```sql
-- =========== MEDIA TABLE ===========

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

-- =========== RLS FOR MEDIA TABLE ===========
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow individual access to media files" ON public.media_files;
DROP POLICY IF EXISTS "Allow read access on media_files" ON public.media_files;
CREATE POLICY "Allow read access on media_files" ON public.media_files FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert access on media_files" ON public.media_files;
CREATE POLICY "Allow insert access on media_files" ON public.media_files FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow update access on media_files" ON public.media_files;
CREATE POLICY "Allow update access on media_files" ON public.media_files FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow delete access on media_files" ON public.media_files;
CREATE POLICY "Allow delete access on media_files" ON public.media_files FOR DELETE USING (auth.uid() = user_id);


-- =========== STORAGE BUCKET ===========

-- Create the 'media_library' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'media_library', 'media_library', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'media_library');

-- =========== RLS FOR STORAGE BUCKET ===========
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'media_library');
DROP POLICY IF EXISTS "Allow individual insert" ON storage.objects;
CREATE POLICY "Allow individual insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media_library' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Allow individual update" ON storage.objects;
CREATE POLICY "Allow individual update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media_library' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Allow individual delete" ON storage.objects;
CREATE POLICY "Allow individual delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media_library' AND auth.uid()::text = (storage.foldername(name))[1]);
```