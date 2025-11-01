# Netlify Deployment Guide

## Problem: Environment Variables Not Loading

The error `ERR_NAME_NOT_RESOLVED` for `your-project.supabase.co` means Netlify isn't loading your environment variables correctly.

## ✅ Solution: Set Environment Variables in Netlify

### Step 1: Add Environment Variables in Netlify Dashboard

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your deployed site
3. Go to **Site settings** → **Environment variables** (or **Build & deploy** → **Environment**)
4. Click **Add a variable** or **Add environment variable**

### Step 2: Add These Variables EXACTLY

Add each variable with the **exact names** (case-sensitive):

```
Key: VITE_SUPABASE_URL
Value: https://mxsllhmxbrslowmazcfm.supabase.co

Key: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14c2xsaG14YnJzbG93bWF6Y2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Nzg1ODUsImV4cCI6MjA3NzU1NDU4NX0.Sc9GsZoG79ZgUVl-MfV3V45DJZhi1BuLMuMTV-JKrHc

Key: VITE_GEMINI_API_KEY
Value: your-actual-gemini-api-key (or leave empty for simulated AI)
```

### Step 3: Important - Set Scope

Make sure to set the variables as:
- ✅ **All scopes** OR
- ✅ **Builds, Functions, and Deploy previews**

### Step 4: Redeploy

After adding the environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. OR Push a new commit to trigger automatic deployment

## Common Issues & Solutions

### Issue 1: Variables Not Updating
**Solution:** Always click **"Clear cache and deploy site"** after changing environment variables.

### Issue 2: Typo in Variable Names  
**Solution:** Ensure exact spelling: `VITE_SUPABASE_URL` (not `VITE_SUPABASE_URL_` or `SUPABASE_URL`)

### Issue 3: Extra Spaces
**Solution:** Make sure there are no spaces before/after the values when pasting.

### Issue 4: Still Getting Errors After Setting Variables
**Solution:** 
1. Check browser console for the new error message
2. The updated code will now show: "Supabase configuration is missing" if variables aren't loaded
3. This helps identify if it's a Netlify config issue or code issue

## Verify Environment Variables Are Working

After deployment, open browser console (F12) and check:

✅ **Success:** No errors about missing environment variables
❌ **Failure:** Error message: "Supabase configuration is missing"

If you see the failure message:
1. Double-check variable names in Netlify dashboard
2. Make sure you clicked "Clear cache and deploy site"
3. Check if you have multiple sites and edited the wrong one

## Build Settings (Verify These)

In Netlify **Build settings**:
- **Build command:** `npm run build` or `vite build`
- **Publish directory:** `dist`
- **Base directory:** (leave empty or set to root)

## Alternative: Using Netlify CLI

You can also set environment variables via CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Set variables
netlify env:set VITE_SUPABASE_URL "https://mxsllhmxbrslowmazcfm.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key-here"
netlify env:set VITE_GEMINI_API_KEY "your-gemini-key-here"

# Redeploy
netlify deploy --prod
```

## Security Note

⚠️ **IMPORTANT:** The ANON key is safe to expose publicly (it's meant for client-side use). However:
- Never expose your Supabase **service_role** key
- Never commit `.env` file to Git (it's already in `.gitignore`)
- Supabase Row Level Security (RLS) protects your data, not the anon key

## Need More Help?

If you're still having issues:
1. Share the exact error from browser console after redeployment
2. Check if the Netlify deploy logs show any build errors
3. Verify the environment variables are showing in the Netlify dashboard
