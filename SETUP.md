# Backend Integration Setup Guide

This guide walks you through completing the backend integration for your Next.js 14 app with Supabase, Discord OAuth, and Stripe.

## Prerequisites

Before proceeding, ensure you have:
- ✅ Created the `profiles` and `videos` tables in Supabase
- ✅ A Discord application with OAuth2 configured
- ✅ A Stripe account with a subscription product created
- ✅ A Discord server (guild) for member verification

## Required Environment Variables

You need to fill in the following values in your `.env.local` file:

### 1. Stripe Price ID
```bash
STRIPE_PRICE_ID=price_YOUR_STRIPE_PRICE_ID_HERE
```
**How to get it:**
1. Go to Stripe Dashboard → Products
2. Find your subscription product
3. Click on the pricing → Copy the Price ID (starts with `price_`)

### 2. Discord Guild ID (Server ID)
```bash
DISCORD_GUILD_ID=YOUR_DISCORD_SERVER_ID_HERE
```
**How to get it:**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click your Discord server icon
3. Click "Copy Server ID"

### 3. Owner Discord ID (Your User ID)
```bash
OWNER_DISCORD_ID=YOUR_DISCORD_USER_ID_HERE
```
**How to get it:**
1. With Developer Mode enabled
2. Right-click your username anywhere in Discord
3. Click "Copy User ID"

## Database Schema

Ensure your Supabase `profiles` table has these columns:

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE,
  email TEXT,
  role TEXT CHECK (role IN ('guest', 'subscriber', 'admin', 'owner')) DEFAULT 'guest',
  subscription_status TEXT CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled')) DEFAULT 'inactive',
  stripe_customer_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Stripe Webhook Configuration

### 1. Setup Webhook in Stripe Dashboard
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set URL to: `https://yourdomain.com/api/webhooks/stripe` (or use Stripe CLI for local testing)
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

### 2. Test Locally with Stripe CLI
```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret (starts with `whsec_`). Update your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_local_webhook_secret
```

## Discord OAuth Configuration

### 1. Configure OAuth2 Redirect
In your Discord Developer Portal:
1. Go to your application → OAuth2 → General
2. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
3. For production, add: `https://yourdomain.com/api/auth/callback/discord`

### 2. Required Scopes
The app requests these scopes (already configured):
- `identify` - Get user information
- `email` - Get user email
- `guilds` - Check server membership

## How It Works

### Authentication Flow
1. User clicks "Sign in with Discord"
2. Discord OAuth redirects back with access token
3. Backend fetches user's Discord guilds
4. Checks if user is member of `DISCORD_GUILD_ID`
5. If member → Create/update profile in Supabase
6. If not member → Deny access

### Owner Backdoor ("God Mode")
- If user's Discord ID matches `OWNER_DISCORD_ID`
- They are automatically assigned `role: 'owner'`
- Only owners see the RoleSwitcher component
- Owners can test UI as any role without affecting database

### Subscription Flow
1. User clicks "Subscribe" → Creates Stripe Checkout Session
2. User completes payment
3. Stripe sends `checkout.session.completed` webhook
4. Backend upgrades user: `role: 'subscriber'`, `subscription_status: 'active'`
5. If subscription cancelled → Downgrade to `role: 'guest'`

## Key Files Explained

### `/types.ts`
Updated `UserProfile` interface to match Supabase schema with all required fields.

### `/types_db.ts`
Database types for type-safe Supabase queries.

### `/lib/supabase.ts`
- `supabase`: Standard client (public use)
- `supabaseAdmin`: Privileged client (server-only, bypasses RLS)

### `/app/api/auth/[...nextauth]/route.ts`
- Discord OAuth provider
- Guild membership verification
- Owner backdoor logic
- Profile upsert on sign-in

### `/app/api/checkout/route.ts`
Creates Stripe checkout session with user metadata.

### `/app/api/webhooks/stripe/route.ts`
Handles Stripe webhooks to upgrade/downgrade user roles based on subscription status.

### `/app/providers.tsx`
- Wraps app in `SessionProvider`
- Syncs NextAuth session with UI state
- Conditionally renders RoleSwitcher for owners only

## Testing Checklist

### ✅ Discord Authentication
- [ ] Sign in with Discord works
- [ ] Non-guild members are denied access
- [ ] Guild members are created in `profiles` table with `role: 'guest'`
- [ ] Owner Discord ID gets `role: 'owner'` automatically

### ✅ Stripe Payments
- [ ] Checkout session creation works
- [ ] Redirects to Stripe Checkout
- [ ] After payment, user is upgraded to `role: 'subscriber'`
- [ ] `stripe_customer_id` is saved to profile

### ✅ Stripe Webhooks
- [ ] `checkout.session.completed` → User upgraded
- [ ] `customer.subscription.deleted` → User downgraded
- [ ] `customer.subscription.updated` → Status reflects in database

### ✅ God Mode (Owner Only)
- [ ] RoleSwitcher appears for owner
- [ ] RoleSwitcher does NOT appear for non-owners
- [ ] Owner can switch roles without database changes
- [ ] UI updates correctly based on selected role

## Common Issues

### "User is not a member of the required Discord guild"
- Verify `DISCORD_GUILD_ID` is correct
- Ensure the authenticating user is a member of that Discord server

### Webhook signature verification failed
- Verify `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret
- For local testing, use Stripe CLI's forwarded secret

### Profile not created in Supabase
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify table schema matches expected structure
- Check server logs for errors

### Owner role not applying
- Verify `OWNER_DISCORD_ID` matches your Discord user ID exactly
- Check that the user has signed in at least once after setting this variable

## Production Deployment

Before deploying:

1. **Update environment variables:**
   - Set production Supabase keys
   - Set production Stripe keys
   - Update `NEXTAUTH_URL` to your domain
   - Add `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

2. **Configure Stripe webhook:**
   - Create production webhook endpoint
   - Update `STRIPE_WEBHOOK_SECRET` with production secret

3. **Update Discord OAuth:**
   - Add production redirect URL

4. **Test thoroughly:**
   - Test sign-in flow
   - Test subscription flow
   - Test webhook events
   - Test role-based access control

## Support

If you encounter issues:
1. Check server logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database schema matches expectations
4. Test webhooks using Stripe CLI first before production
