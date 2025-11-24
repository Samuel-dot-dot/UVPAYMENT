# 👑 Make Yourself the OWNER

## Quick Steps to Become Owner

### Step 1: Find Your Discord ID in Supabase

1. Go to your Supabase project: https://app.supabase.com
2. Click **"Table Editor"** in the left sidebar
3. Click on the **"profiles"** table
4. Find the row where **email** = `samowusu803@gmail.com`
5. Look at the **"discord_id"** column
6. Copy that Discord ID (it's a long number)

### Step 2: Update Your .env.local File

1. Open `.env.local` file
2. Find this line:
   ```bash
   OWNER_DISCORD_ID=841770497280704533
   ```
3. Replace `841770497280704533` with your actual Discord ID
4. Example:
   ```bash
   OWNER_DISCORD_ID=841770497280704533
   ```
5. Save the file

### Step 3: Set Your Role to Owner in Database

**Option A: Use Supabase UI (Easy)**
1. In Supabase → Table Editor → profiles table
2. Find your row (email: samowusu803@gmail.com)
3. Click on the **"role"** cell
4. Change it from `guest` to `owner`
5. Press Enter to save

**Option B: Use SQL (Alternative)**
1. Go to Supabase → SQL Editor
2. Copy and paste this SQL:
   ```sql
   UPDATE profiles
   SET role = 'owner'
   WHERE email = 'samowusu803@gmail.com';
   ```
3. Click **Run** or press `Ctrl + Enter`

### Step 4: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C in terminal)
npm run dev
```

### Step 5: Refresh and Enjoy!

1. Refresh your browser (`Ctrl + F5`)
2. You should now see:
   - **Yellow "Owner" badge** in sidebar
   - **RoleSwitcher widget** in bottom-right corner (God Mode!)
   - Access to Admin Console
   - Upload Video option

---

## 🎯 What You Get as Owner:

### ✅ God Mode (RoleSwitcher)
- Bottom-right floating widget
- Switch between all roles to test UI
- Only YOU can see this widget
- Other users will never see it

### ✅ Full Access
- Dashboard (all views)
- Videos (manage all content)
- Admin Console
- Upload Videos
- All Premium Features

### ✅ Admin Controls
- Access to `/admin` page
- Access to `/upload` page
- Manage content and users

---

## 🔍 How to Find Your Discord ID (Alternative Method)

If you can't find it in Supabase:

1. Open Discord
2. Go to Settings → Advanced
3. Enable **"Developer Mode"**
4. Close settings
5. Right-click your username anywhere
6. Click **"Copy User ID"**
7. That's your Discord ID!

Then add it to `.env.local`:
```bash
OWNER_DISCORD_ID=your_copied_id_here
```

---

## ✅ Verify It's Working

After completing all steps:

1. Check sidebar - should show **yellow "Owner" badge**
2. Check bottom-right corner - should see **RoleSwitcher widget**
3. Check sidebar menu - should see **"Admin Console"** and **"Upload Video"**
4. Go to Profile page - should show **Owner** badge

---

## 🐛 Troubleshooting

### RoleSwitcher not showing?
- Make sure `OWNER_DISCORD_ID` in `.env.local` matches your Discord ID EXACTLY
- Restart dev server after changing `.env.local`
- Clear browser cache

### Still showing as Guest?
- Check database: role should be `owner` not `guest`
- Make sure you restarted the server after updating `.env.local`
- Sign out and sign in again

### Owner badge not appearing?
- Check that your Discord ID matches in:
  1. Database (`discord_id` column)
  2. `.env.local` (`OWNER_DISCORD_ID`)
- Both must be identical

---

## 📝 Summary

1. ✅ Find your Discord ID in Supabase profiles table
2. ✅ Add it to `.env.local` as `OWNER_DISCORD_ID`
3. ✅ Update your role to `owner` in the database
4. ✅ Restart dev server
5. ✅ Enjoy your Owner powers! 👑
