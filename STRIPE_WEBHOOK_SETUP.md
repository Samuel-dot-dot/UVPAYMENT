# Stripe Webhook Setup for Localhost

## The Problem
Your friend paid but didn't get subscriber access because **Stripe webhooks can't reach localhost**.

## Quick Manual Fix (Do This Now!)

### Update User Role Manually in Supabase:

1. Go to: https://app.supabase.com/project/apwazitaolmlizdqtxta/editor
2. Click on **Table Editor** → **profiles**
3. Find your friend's profile (search by email or Discord username)
4. Click on the row to edit
5. Change:
   - `role`: Change from `guest` to `subscriber`
   - `subscription_status`: Change from `inactive` to `active`
6. Click **Save**
7. Tell your friend to **refresh the page** or **log out and log in again**

**This will immediately give them access!**

---

## Permanent Fix: Setup Stripe CLI (for Local Testing)

This allows Stripe to send webhook events to your localhost.

### Step 1: Install Stripe CLI

**Windows:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases/latest
# Or use Scoop:
scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases/latest
```

### Step 2: Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authorize the CLI.

### Step 3: Forward Webhooks to Localhost

Open a **NEW terminal window** (keep your dev server running in the other) and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Update Your .env.local

Copy the new webhook secret from the terminal and update `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Important:** Use the webhook secret from `stripe listen`, NOT from your Stripe Dashboard!

### Step 5: Restart Your Dev Server

```bash
# In your dev server terminal:
# Press Ctrl+C
npm run dev
```

### Step 6: Test!

Now when someone completes a payment:
1. The Stripe CLI will capture the webhook
2. Forward it to your localhost
3. Your app will update the user's role to subscriber
4. User gets instant access!

You'll see webhook events in the Stripe CLI terminal like:
```
2025-11-24 21:30:00   --> checkout.session.completed [evt_xxx]
2025-11-24 21:30:00   <-- [200] POST http://localhost:3000/api/webhooks/stripe
```

---

## For Production (When You Deploy)

When you deploy your site to production (Vercel, Railway, etc.):

1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter your production URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your production environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## Troubleshooting

**"User still showing as guest after payment"**
- ✅ Check that Stripe CLI is running
- ✅ Check terminal logs for webhook events
- ✅ Verify webhook secret in `.env.local` matches Stripe CLI output
- ✅ User must log out and log in again after role change

**"Stripe CLI not forwarding"**
- ✅ Make sure you're running `stripe listen` in a separate terminal
- ✅ Don't close the Stripe CLI terminal
- ✅ The dev server should be running on port 3000

**"Still not working"**
- ✅ Check your server logs when payment happens
- ✅ Look for errors in the webhook handler
- ✅ Manually update the user in Supabase (see Quick Manual Fix above)
