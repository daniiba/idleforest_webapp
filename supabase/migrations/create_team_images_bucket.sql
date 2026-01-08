-- Create storage bucket for team images
-- Run this SQL in your Supabase SQL Editor OR create the bucket in the Supabase Dashboard

-- Option 1: Create bucket via SQL (if your Supabase supports it)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('team-images', 'team-images', true);

-- Option 2 (Recommended): Create bucket in Supabase Dashboard
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "team-images"
-- 4. Enable "Public bucket" toggle
-- 5. Click "Create bucket"

-- After creating the bucket, add these RLS policies:

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload team images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-images');

-- Policy: Allow anyone to view team images (public bucket)
CREATE POLICY "Allow public to view team images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'team-images');

-- Policy: Allow users to delete their own uploads
CREATE POLICY "Allow users to delete their own team images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'team-images' AND (storage.foldername(name))[1] = auth.uid()::text);
