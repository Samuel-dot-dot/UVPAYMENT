-- ===================================================
-- ADD CONTENT TYPE TO VIDEOS TABLE
-- ===================================================
-- This allows differentiating between uploaded videos and external links

-- Add content_type column
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS content_type TEXT CHECK (content_type IN ('video', 'link')) DEFAULT 'video';

-- Add description column if it doesn't exist
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add is_published column if it doesn't exist
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update existing records to be 'video' type
UPDATE public.videos
SET content_type = 'video'
WHERE content_type IS NULL;

-- Create index for content type filtering
CREATE INDEX IF NOT EXISTS idx_videos_content_type ON videos(content_type);
