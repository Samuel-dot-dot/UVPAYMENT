-- =============================================================================
-- SUPABASE DATABASE SETUP
-- =============================================================================
-- Run this SQL in your Supabase SQL Editor to ensure your database is set up correctly
-- Dashboard: https://app.supabase.com/project/_/sql

-- =============================================================================
-- 1. CREATE PROFILES TABLE
-- =============================================================================
-- This stores user information from Discord authentication

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT CHECK (role IN ('guest', 'subscriber', 'admin', 'owner')) DEFAULT 'guest',
  subscription_status TEXT CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled')) DEFAULT 'inactive',
  stripe_customer_id TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on discord_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON profiles(discord_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- =============================================================================
-- 2. CREATE VIDEOS TABLE
-- =============================================================================
-- This stores your video content

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  views INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for sorting by date
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- =============================================================================
-- 3. CREATE UPDATED_AT TRIGGER
-- =============================================================================
-- Automatically update updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to videos table
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. INSERT SAMPLE DATA (OPTIONAL)
-- =============================================================================
-- Uncomment the lines below to add sample videos for testing

-- INSERT INTO videos (title, video_url, thumbnail_url, duration, views, is_locked) VALUES
--   ('Uncensored: Late Night Thoughts', 'https://example.com/video1.mp4', 'https://picsum.photos/800/450?random=1', '14:20', 1240, false),
--   ('Exclusive: Behind The Scenes', 'https://example.com/video2.mp4', 'https://picsum.photos/800/450?random=2', '45:10', 850, false),
--   ('Q&A: No Holds Barred', 'https://example.com/video3.mp4', 'https://picsum.photos/800/450?random=3', '22:15', 3200, false),
--   ('Subscriber Special: Deep Dive', 'https://example.com/video4.mp4', 'https://picsum.photos/800/450?random=4', '12:45', 5400, true);

-- =============================================================================
-- 5. ROW LEVEL SECURITY (OPTIONAL BUT RECOMMENDED)
-- =============================================================================
-- Uncomment to enable RLS for additional security

-- Enable RLS
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to videos
-- CREATE POLICY "Public videos are viewable by everyone" ON videos
--   FOR SELECT USING (true);

-- Allow authenticated users to read their own profile
-- CREATE POLICY "Users can view their own profile" ON profiles
--   FOR SELECT USING (auth.uid()::text = id::text);

-- =============================================================================
-- 6. VERIFY SETUP
-- =============================================================================
-- Run these queries to verify everything is set up correctly

-- Check profiles table
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check videos table
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;

-- Count records
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'videos' as table_name, COUNT(*) as count FROM videos;

-- =============================================================================
-- NOTES:
-- =============================================================================
-- 1. The `id` column in profiles is UUID (auto-generated)
-- 2. The `discord_id` is stored separately as TEXT
-- 3. NextAuth will look up users by discord_id, not by UUID
-- 4. Stripe webhooks will look up users by stripe_customer_id
-- 5. The application uses the UUID internally for session management
