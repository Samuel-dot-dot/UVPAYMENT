-- ===================================================
-- SETUP SUPABASE STORAGE BUCKETS FOR VIDEO UPLOADS
-- ===================================================
-- Run this in your Supabase SQL Editor

-- Create videos bucket (for video files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  5368709120, -- 5GB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/x-matroska', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create thumbnails bucket (for thumbnail images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- STORAGE POLICIES FOR VIDEOS BUCKET
-- ===================================================

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow public read access to videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow admins and owners to delete videos
CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos'
  AND (
    (SELECT role FROM public.profiles WHERE discord_id = (auth.jwt()->>'discord_id')) IN ('admin', 'owner')
  )
);

-- ===================================================
-- STORAGE POLICIES FOR THUMBNAILS BUCKET
-- ===================================================

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'thumbnails');

-- Allow public read access to thumbnails
CREATE POLICY "Public can view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- Allow admins and owners to delete thumbnails
CREATE POLICY "Admins can delete thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND (
    (SELECT role FROM public.profiles WHERE discord_id = (auth.jwt()->>'discord_id')) IN ('admin', 'owner')
  )
);

-- ===================================================
-- VERIFICATION
-- ===================================================
-- Run these to verify the buckets are created:
-- SELECT * FROM storage.buckets;
-- SELECT * FROM storage.policies;
