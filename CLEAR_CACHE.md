# 🧹 Clear All Cache and Restart

## Step 1: Stop Your Dev Server
Press `Ctrl + C` in your terminal

## Step 2: Delete Next.js Cache
Run these commands:

```bash
# Delete .next folder (build cache)
rmdir /s /q .next

# OR on Mac/Linux:
rm -rf .next
```

## Step 3: Clear Browser Cache
1. Open your browser
2. Press `Ctrl + Shift + Delete`
3. Select "Cookies and other site data"
4. Select "Cached images and files"
5. Click "Clear data"

**OR** Use Incognito/Private window

## Step 4: Restart Dev Server
```bash
npm run dev
```

## Step 5: Try Signing In
1. Go to `http://localhost:3000`
2. Click "Sign in with Discord"
3. Watch your terminal for colored log messages:
   - 🔵 Blue = Info
   - ✅ Green = Success
   - ❌ Red = Error

## Step 6: Check Server Logs
When you click sign in, you should see:
```
🔵 SignIn callback started
🔵 Discord ID: 841770497280704533
🔵 Email: your@email.com
🔵 Checking if profile exists...
🔵 Creating new profile...
✅ Profile created successfully
✅ SignIn callback completed successfully
```

If you see any ❌ red errors, copy and send them to me!
