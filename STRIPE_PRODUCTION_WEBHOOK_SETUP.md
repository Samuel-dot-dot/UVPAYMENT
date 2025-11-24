# Stripe Production Webhook Setup Guide

## Overview
This guide will help you create a **production webhook** in Stripe that will work with your deployed website (not localhost).

---

## Step 1: Deploy Your Website First

Before creating the webhook, you need to deploy your site to a hosting platform:

### Recommended Platforms:
- **Vercel** (easiest for Next.js)
- **Railway**
- **Netlify**
- **AWS/Azure**

After deployment, you'll get a URL like:
- `https://yourdomain.com`
- `https://your-app.vercel.app`
- `https://your-app.railway.app`

**⚠️ Important:** You MUST have this URL before proceeding!

---

## Step 2: Create Webhook in Stripe Dashboard

### 2.1 Go to Stripe Dashboard
1. Login to: https://dashboard.stripe.com
2. Make sure you're in **TEST MODE** (toggle in top right) for testing
3. Navigate to: **Developers** → **Webhooks**
4. Click **"Add endpoint"** button

### 2.2 Configure the Endpoint

**Endpoint URL:**
```
https://YOUR-DOMAIN.com/api/webhooks/stripe
```

Replace `YOUR-DOMAIN.com` with your actual deployed URL.

Examples:
- `https://uvpayment.vercel.app/api/webhooks/stripe`
- `https://myapp.railway.app/api/webhooks/stripe`
- `https://www.mysite.com/api/webhooks/stripe`

### 2.3 Select Events to Listen For

Click **"Select events"** and choose these three critical events:

✅ **checkout.session.completed**
- Triggers when payment is successful
- Upgrades user to subscriber

✅ **customer.subscription.updated**
- Triggers when subscription status changes
- Handles renewals, payment failures, etc.

✅ **customer.subscription.deleted**
- Triggers when subscription is cancelled/expired
- Downgrades user to guest

### 2.4 API Version
- Leave as **Latest API version** (or select `2023-10-16`)

### 2.5 Create the Endpoint
- Click **"Add endpoint"**
- Stripe will create the webhook and show you the details

---

## Step 3: Get Your Webhook Signing Secret

After creating the endpoint, you'll see:

1. **Signing secret** - starts with `whsec_...`
2. Click **"Reveal"** to see the full secret
3. **Copy this secret** - you'll need it next

Example:
```
whsec_1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr
```

---

## Step 4: Add Secret to Your Environment Variables

### For Vercel:
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_your_actual_secret_here`
   - **Environment:** Production (and Preview if needed)
4. Click **Save**
5. **Redeploy your app** for changes to take effect

### For Railway:
1. Go to your project
2. Click **Variables** tab
3. Click **+ New Variable**
4. Add:
   - **Variable:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_your_actual_secret_here`
5. Railway will auto-redeploy

### For Other Platforms:
Add `STRIPE_WEBHOOK_SECRET=whsec_your_secret` to your environment variables in your hosting dashboard.

---

## Step 5: Update Your .env.local (For Reference Only)

Update your local `.env.local` file to document the production webhook secret:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_PRODUCT_ID=prod_TT1kD3NmHJkxWJ

# PRODUCTION Webhook Secret (from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret_here

# Note: For local testing, use Stripe CLI:
# stripe listen --forward-to localhost:3000/api/webhooks/stripe
# This will give you a different whsec_ secret for local development
```

**⚠️ Important:** The production webhook secret is DIFFERENT from the Stripe CLI secret!

---

## Step 6: Test Your Webhook

### 6.1 Send Test Event from Stripe Dashboard

1. Go to: **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **"Send test webhook"** button
4. Select **"checkout.session.completed"**
5. Click **"Send test webhook"**

You should see:
- ✅ Response: `200 OK`
- ✅ Request succeeded

### 6.2 Do a Real Test Payment

1. Go to your deployed website
2. Login with Discord
3. Go to pricing page
4. Click "Subscribe Now"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete payment
7. Check if you're upgraded to subscriber

**Test Card Details:**
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

---

## Step 7: Monitor Webhook Events

### View Webhook Logs in Stripe:
1. Go to: **Developers** → **Webhooks**
2. Click on your endpoint
3. View **"Event log"** tab
4. Check for successful deliveries (200 status)

### Check Your Server Logs:
Your webhook handler has extensive logging. Check your hosting platform's logs:

**Vercel:**
- Go to **Deployments** → Click deployment → **Functions** tab

**Railway:**
- Click **Deployments** → View logs

Look for these logs:
```
========== 🔔 WEBHOOK REQUEST RECEIVED ==========
✅ Signature verified successfully!
✅ CHECKOUT COMPLETED!
✅ USER UPGRADED SUCCESSFULLY!
🎉 User xxx is now a SUBSCRIBER!
========== ✅ WEBHOOK PROCESSED SUCCESSFULLY ==========
```

---

## Step 8: Switch to Live Mode (When Ready)

### ⚠️ Only do this when you're ready to accept REAL payments!

1. In Stripe Dashboard, toggle from **Test Mode** to **Live Mode** (top right)
2. Go to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Use the SAME endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
5. Select the SAME three events
6. Get the NEW **live mode** webhook secret (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in your production environment variables
8. Also update:
   - `STRIPE_SECRET_KEY` with live secret key (starts with `sk_live_`)
   - `STRIPE_PUBLISHABLE_KEY` with live publishable key (starts with `pk_live_`)
   - `STRIPE_PRODUCT_ID` with your live product ID (create in live mode)

---

## Troubleshooting

### ❌ Webhook Returns 500 Error

**Check:**
1. Is `STRIPE_WEBHOOK_SECRET` correctly set in production environment?
2. Did you redeploy after adding the environment variable?
3. Check your server logs for error details

### ❌ User Not Upgraded After Payment

**Check:**
1. Is webhook receiving events? (Check Stripe event log)
2. Is webhook secret correct?
3. Check server logs for database errors
4. Verify you ran `FIX_SUBSCRIBER_ROLE.sql` migration

### ❌ Signature Verification Failed

**Causes:**
- Wrong webhook secret
- Using CLI secret instead of dashboard secret
- Webhook secret not updated in production

**Fix:**
- Copy the exact secret from Stripe Dashboard
- Update environment variable
- Redeploy

### ❌ Webhook Not Receiving Events

**Check:**
1. Is your site actually deployed and accessible?
2. Try accessing `https://yourdomain.com/api/webhooks/stripe` in browser
   - Should show "Method Not Allowed" or similar (means endpoint exists)
3. Check webhook URL is correct (no typos)
4. Check your hosting platform's firewall settings

---

## Security Best Practices

✅ **Never commit webhook secrets to Git**
- Keep them in environment variables only

✅ **Use different secrets for test/live mode**
- Test mode: `whsec_test_...`
- Live mode: `whsec_...`

✅ **Verify webhook signatures**
- Already implemented in your code
- Never skip verification

✅ **Monitor webhook failures**
- Check Stripe dashboard regularly
- Set up alerts in Stripe

✅ **Handle retries gracefully**
- Your webhook already returns 200 even on errors
- Log errors for manual intervention

---

## Quick Reference

### Stripe Dashboard URLs:
- **Test Mode Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Live Mode Webhooks:** https://dashboard.stripe.com/webhooks
- **Test Cards:** https://stripe.com/docs/testing

### Your Webhook Endpoint:
```
POST https://YOUR-DOMAIN.com/api/webhooks/stripe
```

### Events to Listen For:
1. `checkout.session.completed` - Payment successful
2. `customer.subscription.updated` - Subscription changed
3. `customer.subscription.deleted` - Subscription cancelled

### Environment Variables Needed:
```env
STRIPE_SECRET_KEY=sk_test_xxx (or sk_live_xxx)
STRIPE_PUBLISHABLE_KEY=pk_test_xxx (or pk_live_xxx)
STRIPE_PRODUCT_ID=prod_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Next Steps After Setup

1. ✅ Test with test card payments
2. ✅ Verify users get upgraded automatically
3. ✅ Test subscription cancellation
4. ✅ Monitor logs for any errors
5. ✅ When ready, switch to live mode
6. ✅ Test again with real cards (your own first!)

---

## Need Help?

If webhooks aren't working:
1. Check Stripe webhook event log
2. Check your server logs
3. Verify environment variables are set
4. Make sure you redeployed after adding secrets
5. Test with "Send test webhook" button first

Good luck! 🚀
