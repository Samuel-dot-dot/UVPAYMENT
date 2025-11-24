-- ===================================================
-- FIX PROFILES TABLE FOR DISCORD OAUTH
-- ===================================================
-- This script fixes the profiles table to work with Discord OAuth
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the old table and recreate it with the correct structure
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Create the new profiles table with auto-generated UUIDs
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'member', 'admin', 'owner')),
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies that work with service role
-- Allow service role to insert (for NextAuth callbacks)
CREATE POLICY "profiles_insert_service"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow service role to update any profile
CREATE POLICY "profiles_update_service"
  ON public.profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to read profiles (you can restrict this later)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Allow service role to delete (optional, for cleanup)
CREATE POLICY "profiles_delete_service"
  ON public.profiles
  FOR DELETE
  USING (true);

-- Step 5: Create an index for faster discord_id lookups
CREATE INDEX idx_profiles_discord_id ON public.profiles(discord_id);

-- Step 6: Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create a trigger to call the function
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- VERIFICATION
-- ===================================================
-- Run these queries to verify the table is set up correctly:

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
