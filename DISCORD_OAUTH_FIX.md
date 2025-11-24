# Discord OAuth Login Stuck/Loading Fix

## Problem
Users get stuck on loading screen when trying to log in with Discord.

## Most Common Causes & Fixes

### 1. Redirect URI Mismatch (MOST COMMON)

**What to check:**
Go to Discord Developer Portal: https://discord.com/developers/applications

1. Select your application
2. Go to **OAuth2** → **General**
3. Check **Redirects** section

**Required Redirect URIs:**

For **localhost/development**:
```
http://localhost:3000/api/auth/callback/discord
```

For **production** (when deployed):
```
https://yourdomain.com/api/auth/callback/discord
```

**⚠️ IMPORTANT:** The redirect URI must EXACTLY match including:
- Protocol (`http://` vs `https://`)
- Port number (`:3000` for localhost)
- Path (`/api/auth/callback/discord`)

### 2. Missing Email Scope

In Discord Developer Portal:
1. Go to **OAuth2** → **General**
2. Under **Default Authorization Link**, make sure these scopes are enabled:
   - ✅ `identify`
   - ✅ `email`

### 3. Application Not Public

In Discord Developer Portal:
1. Go to **OAuth2** → **General**
2. Make sure **PUBLIC BOT** is unchecked (for OAuth apps)
3. Under **OAUTH2 URL Generator**:
   - Select scopes: `identify`, `email`
   - Copy the generated URL

### 4. Check Environment Variables

Make sure `.env.local` has correct values:

```env
DISCORD_CLIENT_ID=your_actual_client_id
DISCORD_CLIENT_SECRET=your_actual_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

**Generate NEXTAUTH_SECRET if missing:**
```bash
openssl rand -base64 32
```

### 5. Clear Browser Cache

Sometimes cached OAuth state causes issues:
1. Clear browser cookies for `localhost:3000`
2. Try in **Incognito/Private** mode
3. Or try a different browser

### 6. Check Server Logs

When your friend tries to log in, check your terminal for:
- ❌ Database connection errors
- ❌ Supabase errors
- ⏰ Timeout messages (I added 10-second timeout)
- ✅ Success messages

## Testing Steps

1. **Restart your dev server** after any `.env.local` changes
2. Have your friend try logging in again
3. Watch the terminal for error messages
4. If it times out after 10 seconds, login should still work (but check what error occurred)

## Still Not Working?

Check these:
1. Is your friend in the Discord server (`DISCORD_GUILD_ID`)?
   - If you have guild restrictions, they must be a member
2. Database permissions:
   - Check if the `profiles` table is accessible
   - Check if `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Network issues:
   - Firewall blocking requests?
   - VPN interfering?

## Quick Fix Checklist

- [ ] Redirect URI matches exactly in Discord Developer Portal
- [ ] Both `identify` and `email` scopes enabled
- [ ] `.env.local` has correct Discord credentials
- [ ] `NEXTAUTH_URL=http://localhost:3000`
- [ ] Server restarted after env changes
- [ ] Tried in incognito mode
- [ ] Checked terminal logs during login attempt
