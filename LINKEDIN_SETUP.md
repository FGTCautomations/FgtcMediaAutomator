# LinkedIn OAuth Setup Instructions

To connect real LinkedIn accounts, you need to properly configure a LinkedIn Developer Application.

## Step 1: Create LinkedIn Developer Application

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the required information:
   - App name: "Social Media Management Platform"
   - LinkedIn Page: (Select your company page or create one)
   - App logo: Upload a logo
   - Legal agreement: Accept the terms

## Step 2: Configure OAuth Settings

1. In your LinkedIn app dashboard, go to "Auth" tab
2. Add this exact OAuth 2.0 redirect URL (copy exactly):
   ```
   https://5828fbb2-5214-4148-8c4e-a0def6d3c2da-00-e29z17qntw83.riker.replit.dev/auth/callback/linkedin
   ```
3. Add the "Sign In with LinkedIn" product to your app (this provides basic profile access)

## Step 3: Request Permissions

### Basic Profile Access (Available by default):
- `r_liteprofile` - Basic profile information
- `r_emailaddress` - Email address

### Marketing API Access (Requires approval):
- `w_member_social` - Post on behalf of members
- `r_organization_social` - Read company page posts
- `w_organization_social` - Post to company pages

## Step 4: Get Your Credentials

1. Copy your Client ID from the "Auth" tab
2. Copy your Client Secret
3. Add these to your Replit Secrets:
   - `LINKEDIN_CLIENT_ID`: Your LinkedIn app client ID
   - `LINKEDIN_CLIENT_SECRET`: Your LinkedIn app client secret

## Step 5: Apply for Marketing API Access (For Posting)

1. In LinkedIn Developer Console, go to "Products" tab
2. Request access to "Marketing Developer Platform"
3. Fill out the application with:
   - Use case: Social media management platform
   - Description: Tool for scheduling and managing LinkedIn posts
   - Expected API usage volume
4. Wait for approval (can take several days)

## Step 6: Test Connection

Once approved, you can use the full posting permissions. Until then, you can connect with basic profile access only.

## Current Status

Your LinkedIn app credentials are configured with:
- Client ID: `78uktkbv3vuzkq`
- Basic scopes: `r_liteprofile,r_emailaddress`
- Redirect URI: Properly configured for this Replit

## Troubleshooting

If you get "unauthorized_scope_error":
1. Check that your LinkedIn app is approved for the requested scopes
2. Verify redirect URI matches exactly
3. Ensure app is in production mode (not development)

If you get "redirect_uri_mismatch":
1. Add the exact redirect URI to your LinkedIn app settings
2. Make sure there are no trailing slashes or extra parameters