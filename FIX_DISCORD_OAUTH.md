# Fix Discord OAuth Error: "Invalid OAuth 2 redirect_uri"

## The Problem
Discord is rejecting the login because your Discord Application doesn't have the correct redirect URL configured.

## The Solution

### Step 1: Go to Discord Developer Portal
1. Visit: https://discord.com/developers/applications
2. Log in with your Discord account
3. Click on your application (the one with Client ID: `1441543643700793429`)

### Step 2: Configure OAuth2 Redirect URLs
1. In the left sidebar, click **"OAuth2"**
2. Scroll down to **"Redirects"** section
3. Click **"Add Redirect"**
4. Add this EXACT URL:
   ```
   http://localhost:3000/api/auth/callback/discord
   ```
5. Click **"Save Changes"** at the bottom

### Step 3: Add Production URL (For Later)
When you deploy to production, you'll also need to add:
```
https://yourdomain.com/api/auth/callback/discord
```
(Replace `yourdomain.com` with your actual domain)

### Step 4: Verify Your .env.local
Make sure these are correct in your `.env.local` file:

```bash
DISCORD_CLIENT_ID=1441543643700793429
DISCORD_CLIENT_SECRET=d5pAKzWat2uj5snobl3--KXpGR07vQby
NEXTAUTH_URL=http://localhost:3000
```

### Step 5: Restart Your Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 6: Test Again
1. Go to `http://localhost:3000`
2. Click "Sign in with Discord"
3. You should now be redirected to Discord successfully!

## Visual Guide

Your Discord OAuth2 settings should look like this:

```
OAuth2 → Redirects:
┌─────────────────────────────────────────────────────────┐
│ http://localhost:3000/api/auth/callback/discord        │  [×]
└─────────────────────────────────────────────────────────┘
                [Add Redirect]
```

## Common Mistakes

❌ **Wrong:** `http://localhost:3000/dashboard`
❌ **Wrong:** `http://localhost:3000/api/auth/discord`
❌ **Wrong:** `http://localhost:3000/callback`
✅ **Correct:** `http://localhost:3000/api/auth/callback/discord`

## Still Not Working?

### Check 1: Make sure there are NO trailing slashes
- ❌ `http://localhost:3000/api/auth/callback/discord/`
- ✅ `http://localhost:3000/api/auth/callback/discord`

### Check 2: Verify the port number
- If you're running on a different port (like 3001), use that:
  ```
  http://localhost:3001/api/auth/callback/discord
  ```

### Check 3: Clear browser cache
- Try in an incognito/private window
- Or clear your browser cache

### Check 4: Check Discord Application Status
- Make sure your Discord app is not rate-limited
- Verify your app has the correct scopes: `identify`, `email`, `guilds`

## What This URL Does

When you click "Sign in with Discord":
1. NextAuth redirects you to Discord
2. You authorize the app
3. Discord redirects back to: `http://localhost:3000/api/auth/callback/discord`
4. NextAuth processes the callback
5. You're logged in!

The URL MUST match exactly what's in Discord's settings.

## Need Help?

If you're still seeing the error:
1. Double-check the redirect URI in Discord settings
2. Make sure you clicked "Save Changes"
3. Restart your dev server
4. Try in an incognito window

The redirect URI should be visible in the error message Discord shows you. Make sure that EXACT URL is in your Discord app settings!
