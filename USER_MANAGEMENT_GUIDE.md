# User Management Feature

## Overview
Admins and owners can now manually manage user roles through the new **Users** page.

---

## What Was Implemented

### 1. **Users Page** (`/users`)
- Access: Only admins and owners
- Features:
  - View all registered users
  - Search by email or Discord ID
  - See user statistics (total, subscribers, admins, guests)
  - Manage user roles with one-click buttons

### 2. **Role Management Permissions**

**Admins can:**
- ✅ Promote guests to subscribers
- ✅ Demote subscribers to guests
- ❌ Cannot create new admins (only owners can)

**Owners can:**
- ✅ Promote guests to subscribers
- ✅ Promote users to admin
- ✅ Demote subscribers/admins to guests
- ✅ Full control (except modifying other owners)

### 3. **Visual Features**
- **Stats Dashboard**: Quick overview of user counts by role
- **Search Bar**: Filter users instantly
- **Role Badges**:
  - 👑 Owner (yellow)
  - 🛡️ Admin (blue)
  - ✅ Subscriber (green/electric-violet)
  - 👤 Guest (gray)
- **Action Buttons**: One-click role changes with loading states
- **Animated Rows**: Smooth entry animations for better UX

---

## How to Use

### Accessing the User Management Page

1. Log in as an admin or owner
2. Look in the sidebar under **Admin Controls**
3. Click on **Users** (icon: 👥)

### Promoting a User to Subscriber

1. Find the user in the table (use search if needed)
2. Click the **→ Subscriber** button next to their name
3. The role will update instantly
4. User will gain subscriber access immediately

### Promoting a User to Admin (Owners Only)

1. Find the user in the table
2. Click the **→ Admin** button
3. User now has admin privileges

### Demoting a User

1. Click the **→ Guest** button to remove subscriber/admin access
2. User will lose premium content access

---

## Important Notes

⚠️ **Before Using This Feature:**

1. **Run the database migration** (`FIX_SUBSCRIBER_ROLE.sql`) if you haven't already:
   ```sql
   ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
   ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
   CHECK (role IN ('guest', 'subscriber', 'admin', 'owner'));
   ```

   Without this, promoting users to subscriber will fail!

2. **User must log out and log back in** after role change to see new permissions

3. **Owner accounts cannot be modified** - they are protected from role changes

---

## API Endpoint

**POST** `/api/users/update-role`

**Request Body:**
```json
{
  "userId": "uuid-here",
  "role": "subscriber" | "admin" | "guest"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "role": "subscriber",
    "subscription_status": "active"
  }
}
```

**Permissions:**
- Requires authentication
- Only admins and owners can call this
- Admins cannot promote to admin role
- Cannot modify owner accounts

---

## Use Cases

### Scenario 1: Friend Paid But Webhook Failed
If Stripe webhooks aren't working and someone paid but didn't get subscriber access:

1. Go to `/users`
2. Search for their email
3. Click **→ Subscriber**
4. Tell them to refresh their page
5. Done! ✅

### Scenario 2: Giving Free Access
Want to give someone free subscriber access?

1. Go to `/users`
2. Find their profile
3. Click **→ Subscriber**
4. They now have full access without paying

### Scenario 3: Promoting Trusted User to Admin
Want to give someone admin privileges? (Owners only)

1. Go to `/users`
2. Find the user
3. Click **→ Admin**
4. They can now upload videos and manage content

---

## Technical Details

### Files Created/Modified:

1. **`app/(protected)/users/page.tsx`** - User management page
2. **`app/api/users/update-role/route.ts`** - API endpoint for role updates
3. **`components/Sidebar.tsx`** - Added Users link to navigation

### Database Changes:
- Updates `profiles.role` column
- Automatically sets `subscription_status` to 'active' when promoting to subscriber
- Sets `subscription_status` to 'inactive' when demoting to guest

### Security:
- Session-based authentication
- Role-based access control
- Cannot modify owner accounts
- Admin restrictions enforced server-side

---

## Troubleshooting

**"Users page shows empty"**
- Check that you're logged in as admin or owner
- Verify profiles exist in your database

**"Role update fails"**
- Run `FIX_SUBSCRIBER_ROLE.sql` migration
- Check server console for error messages
- Verify Supabase connection

**"User still sees old role after update"**
- User must log out and log back in
- Clear browser cache
- Check that update succeeded in database

---

## Next Steps

Now that you have manual user management, you can:
- Fix stuck users who paid but didn't get subscriber access
- Give free access to friends for testing
- Promote trusted users to admins
- Manage your community effectively

**Remember**: This is a complement to automatic Stripe webhooks, not a replacement. Once webhooks are working properly, most role updates will happen automatically!
