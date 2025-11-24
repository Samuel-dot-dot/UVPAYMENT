-- ===================================================
-- FIX SUBSCRIBER ROLE CONSTRAINT
-- ===================================================
-- The profiles table doesn't allow 'subscriber' role
-- This fixes the check constraint to include it

-- Drop the old constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with 'subscriber' included
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('guest', 'subscriber', 'admin', 'owner'));

-- Verify the constraint is updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'profiles_role_check';
