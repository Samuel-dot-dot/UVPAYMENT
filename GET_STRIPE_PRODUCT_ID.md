# How to Get Your Stripe Product ID

## Step-by-Step Instructions:

### 1. Go to Stripe Dashboard
Visit: https://dashboard.stripe.com/test/products

(Make sure you're in **TEST mode** - toggle is in the top right corner)

### 2. Find or Create Your Product

**If you already have a product:**
- You should see your subscription product listed
- Click on it

**If you don't have a product yet:**
1. Click **"+ Add product"**
2. Fill in:
   - **Name**: "Subscription" (or whatever you want)
   - **Description**: Optional
3. Under **Pricing**:
   - Click **"Add another price"**
   - Select **Recurring**
   - Enter your price (e.g., $9.99)
   - Select billing period (e.g., Monthly)
4. Click **"Save product"**

### 3. Get the Product ID

Once you're on the product page:
- Look for **"Product ID"** in the details
- It looks like: `prod_ABC123xyz` (starts with `prod_`)
- Click the copy icon next to it

### 4. Set Default Price (IMPORTANT!)

On the same product page:
1. Scroll down to **"Pricing"** section
2. You should see your price listed
3. Click the **⋮** (three dots) menu next to the price
4. Click **"Set as default"**
5. Make sure it shows **"Default"** badge

### 5. Update Your .env.local File

Open `.env.local` and replace:
```env
STRIPE_PRODUCT_ID=prod_REPLACE_WITH_YOUR_ACTUAL_PRODUCT_ID
```

With your actual Product ID:
```env
STRIPE_PRODUCT_ID=prod_ABC123xyz
```

### 6. Restart Your Server

**IMPORTANT:** After changing `.env.local`:
```bash
# Press Ctrl+C to stop the server
# Then restart it
npm run dev
```

The server must be restarted to load new environment variables!

## Troubleshooting:

**Error: "No such product"**
- ✅ Make sure you copied the Product ID, not the Price ID
- ✅ Product ID starts with `prod_`, not `price_`
- ✅ Make sure you're in TEST mode if using test keys
- ✅ Restart your dev server after updating `.env.local`

**Error: "No default price set"**
- ✅ Go back to product page
- ✅ Set one of your prices as default (Step 4 above)

**Still not working?**
- Double-check there are no quotes around the Product ID in `.env.local`
- Make sure there are no extra spaces
- Verify you saved the file
- Verify the server restarted successfully

## Example .env.local:

```env
# Correct ✅
STRIPE_PRODUCT_ID=prod_ABC123xyz

# Wrong ❌
STRIPE_PRODUCT_ID="prod_ABC123xyz"  # No quotes!
STRIPE_PRODUCT_ID= prod_ABC123xyz   # No space!
STRIPE_PRODUCT_ID=price_123         # This is a PRICE ID, not PRODUCT ID!
```
