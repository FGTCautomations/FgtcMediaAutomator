import type { Express, Request, Response } from "express";
import { storage } from "./storage";

// OAuth configuration for each platform
const OAUTH_CONFIG = {
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    userUrl: "https://graph.facebook.com/me?fields=id,name,accounts{id,name,access_token}",
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    userUrl: "https://api.twitter.com/2/users/me",
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    userUrl: "https://graph.instagram.com/me?fields=id,username",
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userUrl: "https://api.linkedin.com/v2/people/~:(id,firstName,lastName)",
  },
  youtube: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    tokenUrl: "https://oauth2.googleapis.com/token",
    userUrl: "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    tokenUrl: "https://open-api.tiktok.com/oauth/access_token/",
    userUrl: "https://open-api.tiktok.com/user/info/",
  },
};

async function exchangeCodeForToken(platform: string, code: string, redirectUri: string) {
  const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId || "",
    client_secret: config.clientSecret || "",
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

async function getUserInfo(platform: string, accessToken: string) {
  const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const response = await fetch(config.userUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`User info fetch failed: ${response.statusText}`);
  }

  return response.json();
}

export function registerOAuthRoutes(app: Express) {
  // OAuth callback handler
  app.get("/auth/callback/:platform", async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const { code, state, error } = req.query;

      if (error) {
        return res.status(400).send(`OAuth error: ${error}`);
      }

      if (!code || state !== platform) {
        return res.status(400).send("Invalid OAuth callback");
      }

      // Check if platform configuration exists
      const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];
      if (!config || !config.clientId || !config.clientSecret) {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
              <h2>🔧 OAuth Configuration Required</h2>
              <p>To connect your <strong>${platform}</strong> account, you need to set up OAuth credentials:</p>
              
              <h3>Steps to configure:</h3>
              <ol>
                <li>Go to <strong>${platform}</strong> Developer Portal</li>
                <li>Create a new app or use existing one</li>
                <li>Add these environment variables to your Replit Secrets:
                  <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">
${platform.toUpperCase()}_CLIENT_ID=your_client_id
${platform.toUpperCase()}_CLIENT_SECRET=your_client_secret</pre>
                </li>
                <li>Set redirect URI to: <code>${req.protocol}://${req.get('host')}/auth/callback/${platform}</code></li>
              </ol>

              <h3>Developer Portal Links:</h3>
              <ul>
                ${platform === 'facebook' ? '<li><a href="https://developers.facebook.com/apps/" target="_blank">Facebook Developer Console</a></li>' : ''}
                ${platform === 'twitter' ? '<li><a href="https://developer.twitter.com/en/portal/dashboard" target="_blank">Twitter Developer Portal</a></li>' : ''}
                ${platform === 'instagram' ? '<li><a href="https://developers.facebook.com/apps/" target="_blank">Instagram Basic Display API</a></li>' : ''}
                ${platform === 'linkedin' ? '<li><a href="https://www.linkedin.com/developers/apps" target="_blank">LinkedIn Developer Console</a></li>' : ''}
                ${platform === 'youtube' ? '<li><a href="https://console.developers.google.com/" target="_blank">Google Cloud Console</a></li>' : ''}
                ${platform === 'tiktok' ? '<li><a href="https://developers.tiktok.com/" target="_blank">TikTok for Developers</a></li>' : ''}
              </ul>

              <button onclick="window.close()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 20px;">
                Close Window
              </button>
            </body>
          </html>
        `);
      }

      // Exchange authorization code for access token
      const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback/${platform}`;
      const tokenData = await exchangeCodeForToken(platform, code as string, redirectUri);
      
      // Get user info from the platform
      const userInfo = await getUserInfo(platform, tokenData.access_token);
      
      // Extract account details based on platform
      let accountName = "";
      let accountId = "";
      
      switch (platform) {
        case "facebook":
          accountName = userInfo.name || "Facebook User";
          accountId = userInfo.id;
          break;
        case "twitter":
          accountName = `@${userInfo.data?.username || userInfo.username || "twitter_user"}`;
          accountId = userInfo.data?.id || userInfo.id;
          break;
        case "instagram":
          accountName = `@${userInfo.username || "instagram_user"}`;
          accountId = userInfo.id;
          break;
        case "linkedin":
          const firstName = userInfo.firstName?.localized?.en_US || userInfo.firstName;
          const lastName = userInfo.lastName?.localized?.en_US || userInfo.lastName;
          accountName = `${firstName} ${lastName}`.trim() || "LinkedIn User";
          accountId = userInfo.id;
          break;
        case "youtube":
          accountName = userInfo.items?.[0]?.snippet?.title || "YouTube Channel";
          accountId = userInfo.items?.[0]?.id || "youtube_channel";
          break;
        case "tiktok":
          accountName = `@${userInfo.data?.user?.display_name || "tiktok_user"}`;
          accountId = userInfo.data?.user?.union_id || userInfo.data?.user?.open_id;
          break;
      }

      // Save to database
      await storage.createSocialAccount({
        userId: 1, // Default user for MVP
        platform,
        accountName,
        accountId,
        accessToken: tokenData.access_token,
        isConnected: true,
      });

      // Return success page
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 500px; margin: 100px auto; text-align: center; padding: 20px;">
            <h2 style="color: #28a745;">✅ Successfully Connected!</h2>
            <p>Your <strong>${platform}</strong> account <strong>${accountName}</strong> has been connected.</p>
            <p style="color: #666; font-size: 14px;">You can now close this window and start creating posts.</p>
            <script>
              setTimeout(() => {
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
      `);

    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 500px; margin: 100px auto; text-align: center; padding: 20px;">
            <h2 style="color: #dc3545;">❌ Connection Failed</h2>
            <p>Failed to connect your account: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            <button onclick="window.close()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 20px;">
              Close Window
            </button>
          </body>
        </html>
      `);
    }
  });

  // Disconnect account endpoint
  app.delete("/api/social-accounts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteSocialAccount(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to disconnect account" });
    }
  });
}