# Social Media OAuth Setup Guide

## Overview
Your social media automation platform now supports real OAuth connections to authentic social media accounts. To enable these connections, you need to configure OAuth credentials for each platform.

## Required Environment Variables

Add these secrets to your Replit project (use the Secrets tab in the left sidebar):

### Server-side Secrets (Required for OAuth)
```
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

### Client-side Secrets (Optional, for enhanced UX)
```
VITE_FACEBOOK_CLIENT_ID=your_facebook_app_id
VITE_TWITTER_CLIENT_ID=your_twitter_client_id
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_TIKTOK_CLIENT_ID=your_tiktok_client_id
```

## Platform Setup Instructions

### 1. Facebook / Instagram
1. Go to [Facebook Developers Console](https://developers.facebook.com/apps/)
2. Create a new app or use existing one
3. Add "Facebook Login" and "Instagram Basic Display" products
4. Set redirect URI: `https://your-replit-domain.replit.app/auth/callback/facebook`
5. Required permissions: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`

### 2. Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Enable OAuth 2.0
4. Set redirect URI: `https://your-replit-domain.replit.app/auth/callback/twitter`
5. Required scopes: `tweet.read`, `tweet.write`, `users.read`

### 3. LinkedIn
1. Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add "Sign In with LinkedIn" product
4. Set redirect URI: `https://your-replit-domain.replit.app/auth/callback/linkedin`
5. Required scopes: `w_member_social`, `r_liteprofile`

### 4. YouTube (Google)
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or use existing one
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Set redirect URI: `https://your-replit-domain.replit.app/auth/callback/youtube`
6. Required scopes: `https://www.googleapis.com/auth/youtube.upload`

### 5. TikTok
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Enable "Login Kit" and "Content Posting API"
4. Set redirect URI: `https://your-replit-domain.replit.app/auth/callback/tiktok`
5. Required scopes: `user.info.basic`, `video.publish`

## How It Works

1. **User clicks "Connect" button** for any platform
2. **OAuth window opens** with the platform's authentication page
3. **User grants permissions** on the social media platform
4. **Platform redirects back** to your app with an authorization code
5. **Server exchanges code** for access token
6. **Account is saved** and ready for posting

## Testing OAuth Setup

1. Add at least one set of OAuth credentials to your Replit Secrets
2. Click "Add Account" in the dashboard sidebar
3. Try connecting the platform you configured
4. If credentials are missing, you'll see setup instructions
5. If successful, the account will appear in your connected accounts list

## Troubleshooting

- **"OAuth Configuration Required" message**: Add the platform's CLIENT_ID and CLIENT_SECRET to Replit Secrets
- **"Invalid redirect URI" error**: Ensure the redirect URI in your app settings matches exactly
- **"Insufficient permissions" error**: Check that all required scopes are requested in your app configuration
- **Connection window closes without success**: Check the browser console for errors and verify all credentials

## Security Notes

- Never expose CLIENT_SECRET values in frontend code
- Use HTTPS redirect URIs in production
- Regularly rotate OAuth credentials
- Monitor API usage to stay within platform limits