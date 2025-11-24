-- =============================================================================
-- SET OWNER ROLE
-- =============================================================================
-- Run this in Supabase SQL Editor to make yourself the owner

-- First, let's find your Discord ID
SELECT id, discord_id, email, role
FROM profiles
WHERE email = 'samowusu803@gmail.com';

-- Once you see your discord_id in the results above,
-- update the role to owner:

UPDATE profiles
SET role = 'owner'
WHERE email = 'samowusu803@gmail.com';

-- Verify the change:
SELECT id, discord_id, email, role
FROM profiles
WHERE email = 'samowusu803@gmail.com';

-- Copy the discord_id from the results and add it to your .env.local file:
-- OWNER_DISCORD_ID=your_discord_id_here
