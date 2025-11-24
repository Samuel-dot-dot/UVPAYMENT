# ✅ FIXED: UUID Error with Discord Login

## The Problem
The error occurred because:
- Your Supabase `profiles` table has an `id` column with type `UUID`
- Discord IDs are long numbers like `841770497280704533` (not UUIDs)
- We were trying to insert the Discord ID directly into the UUID column ❌

## The Solution
I've updated the code to:
1. ✅ Store Discord ID in the `discord_id` column (TEXT type)
2. ✅ Let Supabase auto-generate the `id` as a UUID
3. ✅ Look up users by `discord_id` instead of `id`
4. ✅ Use the UUID internally for session management

## What Was Changed

### 1. NextAuth Configuration (`app/api/auth/[...nextauth]/route.ts`)
- ✅ Now checks if user exists by `discord_id`
- ✅ Creates new users with auto-generated UUID
- ✅ Updates existing users by matching `discord_id`
- ✅ JWT token stores both `discord_id` and the UUID

### 2. Database Schema
Your `profiles` table should have this structure:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Auto-generated
  discord_id TEXT UNIQUE NOT NULL,                -- Discord user ID
  email TEXT,
  role TEXT DEFAULT 'guest',
  subscription_status TEXT DEFAULT 'inactive',
  stripe_customer_id TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## How to Fix Your Database

### Option 1: Run the SQL Script (Recommended)
1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Open the file: `DATABASE_SETUP.sql`
4. Copy and paste the entire contents
5. Click **Run** or press `Ctrl + Enter`

This will:
- Create the tables if they don't exist
- Add proper indexes for performance
- Set up triggers for `updated_at`
- Ensure correct column types

### Option 2: Verify Your Existing Table
If your table already exists, verify it has the correct structure:

1. Go to Supabase → **Table Editor**
2. Select the `profiles` table
3. Check that these columns exist:
   - `id` - Type: `uuid` - Default: `gen_random_uuid()`
   - `discord_id` - Type: `text` - Unique: ✅
   - `email` - Type: `text`
   - `role` - Type: `text`
   - `subscription_status` - Type: `text`
   - `stripe_customer_id` - Type: `text`
   - `avatar_url` - Type: `text`

### Option 3: Drop and Recreate (If table is empty)
If your `profiles` table is empty and you want to start fresh:

```sql
-- ⚠️ WARNING: This will delete all data in the profiles table!
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run the DATABASE_SETUP.sql script
```

## Test Discord Login

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Try signing in:**
   - Go to `http://localhost:3000`
   - Click "Sign in with Discord"
   - Authorize with Discord
   - You should now be logged in! ✅

3. **Check the database:**
   - Go to Supabase → Table Editor → profiles
   - You should see a new row with:
     - Auto-generated UUID in `id` column
     - Your Discord ID in `discord_id` column
     - Your email
     - Role: `guest`

## How It Works Now

### Sign In Flow:
1. User signs in with Discord
2. Backend gets Discord ID (e.g., `841770497280704533`)
3. Check if profile exists with that `discord_id`
4. If exists → Update email/avatar
5. If new → Create profile with auto-generated UUID
6. JWT token stores both Discord ID and UUID
7. Session uses UUID as `user.id`

### Database Lookup:
- Auth: Looks up by `discord_id`
- Stripe: Looks up by `stripe_customer_id`
- Internal: Uses UUID for `session.user.id`

## Verify It's Working

After signing in, check your server logs. You should see:
```
✅ No more "invalid input syntax for type uuid" errors
✅ Profile created/updated successfully
✅ User redirected to /dashboard
```

## Common Issues

### "Profile not found" error
- Make sure you ran the SQL script
- Check that `discord_id` column exists
- Verify it's type `text`, not `uuid`

### Still getting UUID error
- Make sure you restarted your dev server
- Clear your browser cookies/cache
- Try signing in from an incognito window

### Can't create profile
- Check Supabase logs: Dashboard → Logs
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Make sure the table exists

## Summary

✅ **Fixed:** Discord ID is now stored in `discord_id` (TEXT) column
✅ **Fixed:** UUID is auto-generated for `id` column
✅ **Fixed:** Users are looked up by `discord_id`, not `id`

Your Discord login should work now! 🎉
