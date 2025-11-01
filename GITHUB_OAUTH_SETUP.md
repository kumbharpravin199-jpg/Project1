# GitHub OAuth Setup Guide

## Prerequisites
- A Supabase project
- A GitHub account

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "OAuth Apps" in the left sidebar
3. Click "New OAuth App" button
4. Fill in the application details:
   - **Application name**: `BSIET College Feedback System` (or your preferred name)
   - **Homepage URL**: `https://mxsllhmxbrslowmazcfm.supabase.co` (your Supabase project URL)
   - **Application description**: Student feedback and analytics system
   - **Authorization callback URL**: `https://mxsllhmxbrslowmazcfm.supabase.co/auth/v1/callback`
5. Click "Register application"
6. You'll see your **Client ID** - copy this
7. Click "Generate a new client secret" and copy the **Client Secret**

## Step 2: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **GitHub** in the list of providers
4. Enable GitHub provider
5. Enter the credentials:
   - **Client ID**: (paste from GitHub OAuth app)
   - **Client Secret**: (paste from GitHub OAuth app)
6. Click "Save"

## Step 3: Test the Integration

1. Go to your application's student login page
2. You should see "Continue with GitHub" button
3. Click the button
4. You'll be redirected to GitHub to authorize the app
5. After authorization, you'll be redirected back and logged in automatically

## Important Notes

### Redirect URL Format
The callback URL must be exactly:
```
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

Replace `YOUR_SUPABASE_PROJECT_REF` with your actual project reference (e.g., `mxsllhmxbrslowmazcfm`)

### Local Development
If testing locally, you'll need to add another OAuth app with:
- **Homepage URL**: `http://localhost:5173` (or your local port)
- **Authorization callback URL**: `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`

### User Information
When users sign in with GitHub:
- Their GitHub email becomes their user email
- Their GitHub username is stored in user metadata
- Profile picture from GitHub is available
- They are automatically set as students (not faculty)

### Security
- Never commit your Client Secret to version control
- Keep your Client ID and Secret secure
- Only the callback URL specified in GitHub OAuth app settings will work

## Troubleshooting

### "Redirect URI Mismatch" Error
- Check that the callback URL in GitHub exactly matches: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes or extra characters

### GitHub Authorization Fails
- Verify Client ID and Client Secret are correct in Supabase
- Make sure GitHub OAuth app is not suspended
- Check that the GitHub account has a verified email

### Users Not Logging In
- Check browser console for errors
- Verify Supabase project URL is correct
- Make sure GitHub provider is enabled in Supabase

## Additional Providers (Optional)

You can also add other OAuth providers following similar steps:
- Google OAuth
- Microsoft/Azure
- GitLab
- Bitbucket
- Discord

Each requires creating an OAuth app with that provider and configuring in Supabase.
