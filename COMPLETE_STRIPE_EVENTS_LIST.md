# Complete Stripe Webhook Events for Subscription Platform

## Essential Events (Must Have) ✅

### Payment & Checkout Events
1. **checkout.session.completed**
   - When: Payment successful, checkout completed
   - Action: Upgrade user to subscriber, create customer record
   - Priority: CRITICAL

2. **checkout.session.async_payment_succeeded**
   - When: Async payment methods (bank transfers, etc.) succeed
   - Action: Same as checkout.session.completed
   - Priority: HIGH

3. **checkout.session.async_payment_failed**
   - When: Async payment fails
   - Action: Send notification, keep user as guest
   - Priority: MEDIUM

### Subscription Lifecycle Events
4. **customer.subscription.created**
   - When: New subscription is created
   - Action: Log subscription start, set up customer record
   - Priority: HIGH

5. **customer.subscription.updated**
   - When: Subscription changes (renewal, plan change, status change)
   - Action: Update user role based on status
   - Priority: CRITICAL

6. **customer.subscription.deleted**
   - When: Subscription ends or is cancelled
   - Action: Downgrade user to guest
   - Priority: CRITICAL

7. **customer.subscription.trial_will_end**
   - When: Trial period ending in 3 days (if you use trials)
   - Action: Send reminder email
   - Priority: LOW (if no trials)

### Payment Events
8. **invoice.paid**
   - When: Invoice is successfully paid (monthly renewals)
   - Action: Confirm subscription is active, extend access
   - Priority: HIGH

9. **invoice.payment_failed**
   - When: Payment fails (expired card, insufficient funds)
   - Action: Mark subscription as past_due, send notification
   - Priority: CRITICAL

10. **invoice.payment_action_required**
    - When: Additional authentication needed (3D Secure)
    - Action: Email user to complete authentication
    - Priority: HIGH

11. **invoice.upcoming**
    - When: 7 days before next payment attempt
    - Action: Send reminder/warning about upcoming charge
    - Priority: MEDIUM

### Customer Events
12. **customer.updated**
    - When: Customer details change (email, payment method)
    - Action: Sync customer data to your database
    - Priority: MEDIUM

13. **customer.deleted**
    - When: Customer is deleted from Stripe
    - Action: Clean up user data, revoke access
    - Priority: MEDIUM

### Payment Method Events
14. **payment_method.attached**
    - When: Payment method added to customer
    - Action: Update default payment method
    - Priority: LOW

15. **payment_method.detached**
    - When: Payment method removed
    - Action: Warn user if no payment methods left
    - Priority: MEDIUM

### Charge Events
16. **charge.succeeded**
    - When: Payment charge succeeds
    - Action: Log transaction for records
    - Priority: MEDIUM

17. **charge.failed**
    - When: Charge fails
    - Action: Log failed payment, notify user
    - Priority: HIGH

18. **charge.refunded**
    - When: Payment is refunded
    - Action: Revoke access, update subscription status
    - Priority: HIGH

19. **charge.dispute.created**
    - When: Customer disputes/chargebacks a payment
    - Action: Flag account, potentially suspend access
    - Priority: HIGH

### Refund Events
20. **charge.refund.updated**
    - When: Refund status changes
    - Action: Handle partial/full refunds
    - Priority: MEDIUM

---

## Recommended Events to Add to Your Webhook

### For Production, Add These Events:

```
✅ checkout.session.completed
✅ checkout.session.async_payment_succeeded
✅ checkout.session.async_payment_failed

✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted

✅ invoice.paid
✅ invoice.payment_failed
✅ invoice.payment_action_required

✅ charge.succeeded
✅ charge.failed
✅ charge.refunded
✅ charge.dispute.created

✅ customer.updated
✅ customer.deleted

✅ payment_method.detached
```

---

## Events by Priority

### 🔴 CRITICAL (Must Handle)
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 🟡 HIGH (Should Handle)
- `checkout.session.async_payment_succeeded`
- `invoice.paid`
- `invoice.payment_action_required`
- `charge.failed`
- `charge.refunded`
- `charge.dispute.created`
- `customer.subscription.created`

### 🟢 MEDIUM (Nice to Have)
- `checkout.session.async_payment_failed`
- `invoice.upcoming`
- `customer.updated`
- `customer.deleted`
- `payment_method.detached`
- `charge.succeeded`

### ⚪ LOW (Optional)
- `customer.subscription.trial_will_end`
- `payment_method.attached`
- `charge.refund.updated`

---

## Quick Selection Guide

### Minimum Setup (Basic Functionality)
```
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
```

### Recommended Setup (Production Ready)
```
checkout.session.completed
checkout.session.async_payment_succeeded
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
invoice.payment_action_required
charge.refunded
charge.dispute.created
```

### Complete Setup (Full Coverage)
Select ALL events listed above for maximum coverage and troubleshooting capability.

---

## How to Add All Events in Stripe Dashboard

### Method 1: Select Individually
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your URL: `https://yourdomain.com/api/webhooks/stripe`
4. Click **"Select events"**
5. Search for each event and check the box
6. Click **"Add events"**

### Method 2: Select All Events (Easiest)
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your URL: `https://yourdomain.com/api/webhooks/stripe`
4. Instead of clicking "Select events", scroll down
5. Toggle **"Listen to all events"** switch
6. Click **"Add endpoint"**

**⚠️ Note:** "Listen to all events" means you'll receive EVERY Stripe event. Your webhook handler should gracefully ignore unknown events (which it already does).

---

## Your Current Webhook Handler Support

Your `/api/webhooks/stripe/route.ts` currently handles:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.deleted`
- ✅ `customer.subscription.updated`

All other events are safely ignored (returns 200 OK) but not processed.

---

## Events You Should Add Next

Let me know if you want me to update your webhook handler to support more events. Here are the most important ones to add:

### 1. Invoice Payment Failed
```typescript
if (event.type === 'invoice.payment_failed') {
  // Mark subscription as past_due
  // Send email notification
  // Give grace period before downgrading
}
```

### 2. Charge Refunded
```typescript
if (event.type === 'charge.refunded') {
  // Immediately revoke access
  // Downgrade to guest
  // Log refund
}
```

### 3. Dispute Created
```typescript
if (event.type === 'charge.dispute.created') {
  // Flag account
  // Potentially suspend access
  // Notify admin
}
```

### 4. Async Payment Succeeded
```typescript
if (event.type === 'checkout.session.async_payment_succeeded') {
  // Same logic as checkout.session.completed
  // Upgrade user to subscriber
}
```

---

## Recommended: Listen to All Events

**Best Practice:** Set your webhook to "Listen to all events" because:
- ✅ You won't miss any important events
- ✅ Stripe adds new events over time
- ✅ Better for debugging (see all activity)
- ✅ Your handler already ignores unknown events safely
- ✅ No performance impact

You can always check the Stripe event log to see what's happening, even if you don't actively process every event.

---

## What's Your Deployed URL?

Tell me your deployed URL and I'll give you the exact webhook endpoint to use:
- Example: `https://uvpayment.vercel.app`
- Your endpoint will be: `https://uvpayment.vercel.app/api/webhooks/stripe`

---

## Want Me to Update Your Webhook Handler?

I can update `/api/webhooks/stripe/route.ts` to handle these additional important events:
1. `invoice.payment_failed` - Handle failed payments gracefully
2. `charge.refunded` - Revoke access on refunds
3. `charge.dispute.created` - Handle chargebacks
4. `checkout.session.async_payment_succeeded` - Support more payment methods

Let me know if you want these additions! 🚀
