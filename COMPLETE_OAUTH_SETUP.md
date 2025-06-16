# Complete OAuth Setup Guide for 9 Social Media Platforms

## Overview
Your social media automation platform now supports OAuth integration for 9 major platforms. Each platform requires specific credentials and configuration steps.

## Quick Setup Checklist

Add these environment variables to your Replit Secrets:

### Required Server Credentials
```
# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Instagram (via Facebook)
INSTAGRAM_CLIENT_ID=your_facebook_app_id
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# YouTube & Google My Business (shared Google credentials)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Bluesky
BLUESKY_CLIENT_ID=your_bluesky_handle
BLUESKY_CLIENT_SECRET=your_app_password

# Tumblr
TUMBLR_CLIENT_ID=your_tumblr_consumer_key
TUMBLR_CLIENT_SECRET=your_tumblr_consumer_secret

# TikTok
TIKTOK_CLIENT_ID=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Pinterest
PINTEREST_CLIENT_ID=your_pinterest_app_id
PINTEREST_CLIENT_SECRET=your_pinterest_app_secret
```

### Optional Frontend Credentials (for better UX)
```
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_INSTAGRAM_CLIENT_ID=your_facebook_app_id
VITE_TWITTER_CLIENT_ID=your_twitter_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_BLUESKY_CLIENT_ID=your_bluesky_handle
VITE_TUMBLR_CLIENT_ID=your_tumblr_consumer_key
VITE_TIKTOK_CLIENT_ID=your_tiktok_client_key
VITE_PINTEREST_CLIENT_ID=your_pinterest_app_id
```

## Platform-Specific Setup Instructions

### 1. LinkedIn
**Portal:** https://www.linkedin.com/developers/apps
**Redirect URI:** `https://your-domain.replit.app/auth/callback/linkedin`
**Scopes:** `w_member_social,r_liteprofile,r_organization_social,w_organization_social`

Steps:
1. Create LinkedIn app and associate with Company Page
2. Add "Sign In with LinkedIn" and "Share on LinkedIn" products
3. Request Marketing Developer Platform access
4. Verify company domain for organization posting

### 2. Instagram
**Portal:** https://developers.facebook.com/apps/
**Redirect URI:** `https://your-domain.replit.app/auth/callback/instagram`
**Scopes:** `instagram_basic,instagram_content_publish,pages_read_engagement`

Steps:
1. Create Facebook app and add Instagram Basic Display product
2. Add Instagram Content Publishing API for business accounts
3. Connect Instagram Business or Creator account
4. Submit for app review if needed

### 3. Twitter/X
**Portal:** https://developer.twitter.com/en/portal/dashboard
**Redirect URI:** `https://your-domain.replit.app/auth/callback/twitter`
**Scopes:** `tweet.read,tweet.write,users.read,offline.access`

Steps:
1. Apply for Twitter Developer account access
2. Create new project and app
3. Enable OAuth 2.0 with PKCE
4. Generate Client ID and Client Secret

### 4. YouTube
**Portal:** https://console.developers.google.com/
**Redirect URI:** `https://your-domain.replit.app/auth/callback/youtube`
**Scopes:** `https://www.googleapis.com/auth/youtube.upload,https://www.googleapis.com/auth/youtube`

Steps:
1. Create Google Cloud project
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials (Web application)
4. Set up OAuth consent screen

### 5. Google My Business
**Portal:** https://console.developers.google.com/
**Redirect URI:** `https://your-domain.replit.app/auth/callback/googlemybusiness`
**Scopes:** `https://www.googleapis.com/auth/business.manage`

Steps:
1. Use same Google Cloud project as YouTube
2. Enable Google My Business API
3. Verify ownership of business locations
4. Use same OAuth credentials as YouTube

### 6. Bluesky
**Portal:** https://bsky.social
**Redirect URI:** `https://your-domain.replit.app/auth/callback/bluesky`
**Authentication:** AT Protocol (not traditional OAuth)

Steps:
1. Create Bluesky account at bsky.social
2. Go to Settings > Privacy and Security
3. Generate App Password
4. Use handle as CLIENT_ID and app password as CLIENT_SECRET

### 7. Tumblr
**Portal:** https://www.tumblr.com/oauth/apps
**Redirect URI:** `https://your-domain.replit.app/auth/callback/tumblr`
**Scopes:** `write,offline_access`

Steps:
1. Register new OAuth application
2. Add application details and callback URL
3. Note OAuth Consumer Key and Consumer Secret
4. Configure OAuth 2.0 settings

### 8. TikTok
**Portal:** https://developers.tiktok.com/
**Redirect URI:** `https://your-domain.replit.app/auth/callback/tiktok`
**Scopes:** `user.info.basic,user.info.profile,video.publish,video.list`

Steps:
1. Apply for TikTok for Developers access
2. Create app with content posting use case
3. Enable Login Kit and Content Posting API
4. Submit for app review and approval

### 9. Pinterest
**Portal:** https://developers.pinterest.com/apps/
**Redirect URI:** `https://your-domain.replit.app/auth/callback/pinterest`
**Scopes:** `boards:read,boards:write,pins:read,pins:write,user_accounts:read`

Steps:
1. Create Pinterest Business account
2. Register new app in Developer portal
3. Add website and verify domain ownership
4. Configure OAuth redirect URIs

## Testing Your Setup

1. Click "Add Account" in your dashboard sidebar
2. Select any platform you've configured
3. If credentials are missing: Setup instructions will appear
4. If credentials are configured: OAuth flow will begin
5. Complete authentication on the platform
6. Account will be saved and appear in your connected accounts

## Common Issues & Solutions

**"Invalid App ID" Error:** Add CLIENT_ID and CLIENT_SECRET to Replit Secrets
**"Invalid redirect URI" Error:** Ensure redirect URI matches exactly in app settings
**"Insufficient permissions" Error:** Check that all required scopes are configured
**Connection window closes without success:** Check browser console and verify credentials

## Security Best Practices

- Keep CLIENT_SECRET values secure in server-side environment variables only
- Use HTTPS redirect URIs in production
- Regularly rotate OAuth credentials
- Monitor API usage to stay within platform limits
- Test with personal accounts before connecting business accounts

## Platform-Specific Notes

**LinkedIn:** Requires company verification for organization posting
**Instagram:** Must be Business or Creator account for content publishing
**Twitter:** May require developer account approval
**YouTube:** Requires OAuth consent screen verification
**TikTok:** Requires app review for production use
**Pinterest:** Requires Business account and domain verification
**Bluesky:** Uses AT Protocol instead of traditional OAuth
**Google My Business:** Requires business location ownership verification