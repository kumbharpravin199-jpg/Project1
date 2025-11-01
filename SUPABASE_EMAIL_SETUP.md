# Supabase Email Verification Redirect Setup

## Problem
After users verify their email through Supabase, they're being redirected to `localhost` instead of your deployed website.

## ✅ Solution Implemented

### Code Changes Made:
1. Updated `src/lib/supabase.ts` to include `emailRedirectTo` option in signup functions
2. Added `getRedirectUrl()` function that uses `VITE_APP_URL` from environment variables
3. Both student and faculty signup now redirect to the correct URL after email verification

## 🚀 Configuration Steps (IMPORTANT - Do These!)

### Step 1: Update Supabase Dashboard Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **mxsllhmxbrslowmazcfm**
3. Go to **Authentication** → **URL Configuration**
4. Update these settings:

#### Site URL:
```
https://feedbackwebsitee.netlify.app
```

#### Redirect URLs (Add all these):
```
https://feedbackwebsitee.netlify.app
https://feedbackwebsitee.netlify.app/
https://feedbackwebsitee.netlify.app/**
http://localhost:5173
http://localhost:5173/
```

⚠️ **Important:** 
- Click **Add URL** after entering each redirect URL
- Make sure to include both with and without trailing slash
- Keep localhost URLs for local development

### Step 2: Update Netlify Environment Variables

Make sure this variable is set in your Netlify dashboard:

```
Key: VITE_APP_URL
Value: https://feedbackwebsitee.netlify.app/
```

(Note: Include the trailing slash `/` at the end)

### Step 3: Email Template Settings (Optional but Recommended)

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Update the confirmation link to use your domain

Default template uses:
```
{{ .ConfirmationURL }}
```

You can customize the email message to be more user-friendly:
```html
<h2>Confirm your signup</h2>
<p>Click the link below to verify your email address and access the feedback system:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>This link will redirect you to: https://feedbackwebsitee.netlify.app</p>
```

## How It Works Now

### For Students:
1. Student signs up with email and password
2. Supabase sends verification email
3. Student clicks verification link in email
4. Supabase verifies the email
5. **User is redirected to:** `https://feedbackwebsitee.netlify.app/`
6. Student is automatically logged in
7. Success message shows: "Email verified! You can now submit feedback."

### For Faculty:
1. Faculty signs up with faculty/admin email
2. Supabase sends verification email
3. Faculty clicks verification link
4. Supabase verifies the email
5. **User is redirected to:** `https://feedbackwebsitee.netlify.app/`
6. Faculty is automatically logged in to dashboard

## Testing

### Test Email Verification:
1. Create a new account on your deployed site
2. Check your email for verification link
3. Click the verification link
4. Verify you're redirected to: `https://feedbackwebsitee.netlify.app/`
5. Verify you're automatically logged in

### If It Still Redirects to Localhost:
- Clear your browser cache and cookies
- Make sure you updated the Supabase Redirect URLs (Step 1)
- Make sure you deployed the latest code with updated `supabase.ts`
- Try in an incognito/private browser window

## Email Verification Flow

```
User Signs Up
     ↓
Supabase Sends Email
     ↓
User Clicks Email Link
     ↓
Supabase Verifies Email
     ↓
Redirect to: VITE_APP_URL (https://feedbackwebsitee.netlify.app/)
     ↓
User Lands on Your Site (Auto-logged in)
     ↓
Success! ✅
```

## Disable Email Verification (Optional - Not Recommended)

If you want users to login immediately without email verification:

1. Go to Supabase Dashboard
2. **Authentication** → **Providers** → **Email**
3. Uncheck **"Confirm email"**
4. Click **Save**

⚠️ **Warning:** This is not recommended for production as it allows fake email addresses.

## Common Issues

### Issue 1: Still Redirecting to Localhost
**Solution:** 
- Check Supabase Redirect URLs include your Netlify URL
- Redeploy your site after code changes
- Clear browser cache

### Issue 2: "Email link is invalid or has expired"
**Solution:**
- Email verification links expire after 24 hours
- Request a new verification email
- Check if email was already verified

### Issue 3: Redirects but User Not Logged In
**Solution:**
- This is a Supabase auth state sync issue
- The code handles this automatically with `getSession()`
- Refresh the page after redirect

## Security Notes

✅ **Best Practices:**
- Always verify emails in production
- Use HTTPS for all redirect URLs
- Keep localhost URLs only for development
- Regularly check Supabase logs for suspicious activity

## Need Help?

If verification still doesn't work:
1. Check Supabase Dashboard → Authentication → Users to see if email is verified
2. Check browser console for any auth errors
3. Verify the Redirect URLs are correctly set in Supabase
4. Make sure VITE_APP_URL is set in Netlify environment variables
