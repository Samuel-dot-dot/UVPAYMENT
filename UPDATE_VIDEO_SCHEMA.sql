-- ===================================================
-- UPDATE VIDEOS TABLE SCHEMA
-- ===================================================
-- Make thumbnail_url and description optional

-- Update the videos table to allow null for thumbnail_url
ALTER TABLE public.videos
ALTER COLUMN thumbnail_url DROP NOT NULL;

-- Description should already be nullable, but just to be sure:
ALTER TABLE public.videos
ALTER COLUMN description DROP NOT NULL;
