# Complete Vercel Deployment Guide for UVPayment

## Prerequisites Checklist

Before deploying, make sure you have:
- ✅ GitHub account
- ✅ Vercel account (sign up at vercel.com with GitHub)
- ✅ All environment variables ready
- ✅ Supabase project set up
- ✅ Stripe account configured

---

## Step 1: Prepare Your Repository

### 1.1 Create .gitignore (If Not Exists)

Make sure your `.gitignore` includes:

```
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# next.js
.next/
out/
build/
dist/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 1.2 Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create GitHub repository (go to github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Import Project

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**

### 2.2 Configure Project Settings

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` or `next build` (auto-detected)

**Output Directory:** `.next` (auto-detected)

**Install Command:** `npm install` (auto-detected)

---

## Step 3: Add Environment Variables

Before clicking "Deploy", add all your environment variables:

### Click "Environment Variables" dropdown and add these:

#### 3.1 Next Auth
```
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

**⚠️ Important:**
- Generate `NEXTAUTH_SECRET` by running: `openssl rand -base64 32`
- For `NEXTAUTH_URL`, use your Vercel URL (you'll get this after deployment, you can update it later)

#### 3.2 Discord OAuth
```
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

#### 3.3 Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### 3.4 Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_PRODUCT_ID=prod_TT1kD3NmHJkxWJ
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

**Note:** We'll update `STRIPE_WEBHOOK_SECRET` after creating the webhook in Step 5.

**Note:** Set `NEXTAUTH_URL` to a placeholder for now like `https://placeholder.vercel.app`, we'll update it after deployment.

---

## Step 4: Deploy!

1. After adding all environment variables, click **"Deploy"**
2. Wait 2-5 minutes for deployment to complete
3. You'll get a URL like: `https://your-app-name.vercel.app`
4. Click **"Visit"** to see your live site!

---

## Step 5: Update Discord OAuth Redirect URI

### 5.1 Get Your Vercel URL
After deployment, copy your Vercel URL (e.g., `https://uvpayment.vercel.app`)

### 5.2 Update Discord Application
1. Go to: https://discord.com/developers/applications
2. Select your application
3. Go to **OAuth2** → **General**
4. Under **Redirects**, add:
   ```
   https://your-app-name.vercel.app/api/auth/callback/discord
   ```
5. Click **"Save Changes"**

### 5.3 Update NEXTAUTH_URL in Vercel
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL`
4. Click **Edit**
5. Change value to: `https://your-app-name.vercel.app`
6. Click **Save**
7. **Redeploy** your app (go to Deployments tab → click three dots → Redeploy)

---

## Step 6: Create Stripe Production Webhook

### 6.1 Create Webhook Endpoint

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://your-app-name.vercel.app/api/webhooks/stripe`
4. Click **"Select events"** or toggle **"Listen to all events"**

### 6.2 Recommended: Select These Events

If not using "Listen to all events", select these:

**Checkout Events:**
- ✅ `checkout.session.completed`
- ✅ `checkout.session.async_payment_succeeded`
- ✅ `checkout.session.async_payment_failed`

**Subscription Events:**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

**Invoice Events:**
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`
- ✅ `invoice.payment_action_required`

**Charge Events:**
- ✅ `charge.succeeded`
- ✅ `charge.failed`
- ✅ `charge.refunded`
- ✅ `charge.dispute.created`

**Customer Events:**
- ✅ `customer.updated`
- ✅ `customer.deleted`

### 6.3 Get Webhook Signing Secret

1. After creating the endpoint, click to view details
2. Click **"Reveal"** under **Signing secret**
3. Copy the secret (starts with `whsec_`)

### 6.4 Add Webhook Secret to Vercel

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Find `STRIPE_WEBHOOK_SECRET`
3. Click **Edit**
4. Paste your new webhook secret
5. Click **Save**
6. **Redeploy** your app

---

## Step 7: Test Your Deployment

### 7.1 Test Discord Login
1. Visit your deployed site
2. Click "Login with Discord"
3. Authorize the app
4. You should be logged in

### 7.2 Test Stripe Payment
1. Login to your site
2. Go to pricing page
3. Click "Subscribe Now"
4. Use test card: `4242 4242 4242 4242`
5. Complete payment
6. You should be upgraded to subscriber
7. Welcome modal should appear

### 7.3 Check Webhook Logs
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Event log** tab
4. Should see successful deliveries (200 status)

### 7.4 Check Vercel Logs
1. Go to Vercel project → **Deployments**
2. Click on latest deployment
3. Click **"Functions"** tab
4. Check logs for webhook processing

---

## Step 8: Custom Domain (Optional)

### 8.1 Add Custom Domain in Vercel
1. Go to project **Settings** → **Domains**
2. Enter your domain (e.g., `uvpayment.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

### 8.2 Update After Custom Domain
Once domain is active, update:

**In Vercel:**
- `NEXTAUTH_URL` → `https://yourdomain.com`

**In Discord Developer Portal:**
- Add redirect: `https://yourdomain.com/api/auth/callback/discord`

**In Stripe Dashboard:**
- Add new webhook endpoint with custom domain URL
- Update `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Troubleshooting

### ❌ Build Failed

**Check:**
- All dependencies in `package.json`
- No TypeScript errors locally
- Node version compatibility

**Fix:**
```bash
# Test build locally first
npm run build

# If fails, fix errors then commit and push
git add .
git commit -m "Fix build errors"
git push
```

### ❌ Environment Variables Not Working

**Fix:**
1. Check all variables are added in Vercel
2. No quotes around values
3. No spaces in variable names
4. Redeploy after adding/updating variables

### ❌ Discord OAuth Not Working

**Check:**
1. Redirect URI matches exactly: `https://your-domain.vercel.app/api/auth/callback/discord`
2. `NEXTAUTH_URL` is set correctly
3. Discord app is not in development mode restrictions

### ❌ Stripe Webhooks Not Working

**Check:**
1. Webhook URL is correct: `https://your-domain.vercel.app/api/webhooks/stripe`
2. `STRIPE_WEBHOOK_SECRET` is from the production webhook (not CLI)
3. Webhook is in correct mode (test/live)
4. Check Vercel function logs for errors

### ❌ Database Errors

**Check:**
1. Ran `FIX_SUBSCRIBER_ROLE.sql` migration in Supabase
2. Supabase service role key is correct
3. Database connection not blocked by firewall

---

## Post-Deployment Checklist

After successful deployment:

✅ Site loads correctly
✅ Discord login works
✅ Test payment succeeds
✅ User upgraded to subscriber
✅ Webhook events showing in Stripe dashboard
✅ No errors in Vercel function logs
✅ Subscription cancellation works
✅ Admin/owner can access user management
✅ Video uploads work (if using file upload)
✅ Content links work (if using link mode)

---

## Performance Optimization (After Deployment)

### Enable Vercel Analytics
1. Go to project **Analytics** tab
2. Click **"Enable Web Analytics"**
3. Free tier includes basic metrics

### Enable Speed Insights
1. Go to project **Speed Insights** tab
2. Click **"Enable Speed Insights"**
3. Monitor Core Web Vitals

### Configure Caching
Your Next.js app already has optimized caching, but you can:
1. Check **Caching** settings in Vercel
2. Configure edge functions if needed
3. Use Vercel Edge Network for better performance

---

## Going Live with Real Payments

### When Ready for Production:

1. **Switch Stripe to Live Mode:**
   - Get live API keys from Stripe
   - Create new product in live mode
   - Update environment variables:
     - `STRIPE_SECRET_KEY` → `sk_live_...`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
     - `STRIPE_PRODUCT_ID` → live product ID

2. **Create Live Mode Webhook:**
   - Create new webhook in live mode
   - Use same events
   - Update `STRIPE_WEBHOOK_SECRET` with live secret

3. **Test with Real Card:**
   - Use your own card first
   - Verify payment flow works
   - Check webhook processes correctly

4. **Monitor:**
   - Check Stripe dashboard daily
   - Monitor Vercel logs
   - Set up error alerts

---

## Useful Vercel Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from command line
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# List deployments
vercel ls
```

---

## Important URLs to Bookmark

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Discord Developer Portal:** https://discord.com/developers/applications
- **Supabase Dashboard:** https://app.supabase.com
- **Your Live Site:** https://your-app-name.vercel.app

---

## Quick Deployment Checklist

Before clicking "Deploy" in Vercel:

✅ Code pushed to GitHub
✅ `.env.local` NOT committed to Git
✅ All environment variables added in Vercel
✅ `NEXTAUTH_SECRET` generated
✅ Database migrations run in Supabase
✅ Discord OAuth app created
✅ Stripe product created

After deployment:

✅ Update `NEXTAUTH_URL` with real Vercel URL
✅ Update Discord redirect URI
✅ Create Stripe webhook
✅ Update `STRIPE_WEBHOOK_SECRET`
✅ Redeploy
✅ Test everything

---

Good luck with your deployment! 🚀

Let me know your Vercel URL once deployed and I'll help you verify everything is working correctly!
