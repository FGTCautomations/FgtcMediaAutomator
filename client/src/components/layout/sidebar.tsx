import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn, getPlatformIcon, getPlatformColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { SocialAccount } from "@shared/schema";


const navigationItems = [
  { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
  { path: "/calendar", label: "Content Calendar", icon: "fas fa-calendar-alt" },
  { path: "/compose", label: "Compose", icon: "fas fa-edit" },
  { path: "/analytics", label: "Analytics", icon: "fas fa-chart-bar" },
  { path: "/automations", label: "Automations", icon: "fas fa-cog" },
  { path: "/content-library", label: "Content Library", icon: "fas fa-folder" },
  { path: "/team", label: "Team", icon: "fas fa-users" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [showAccountModal, setShowAccountModal] = useState(false);
  
  const { data: socialAccounts = [] } = useQuery<SocialAccount[]>({
    queryKey: ["/api/social-accounts"],
  });

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-rocket text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">FGTC</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Social Automations</p>
          </div>
        </div>
      </div>

      {/* Account Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="fab fa-facebook-f text-white text-sm"></i>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Main Account</span>
          </div>
          <i className="fas fa-chevron-down text-gray-400 text-sm"></i>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={cn(
                "sidebar-nav-item",
                location === item.path && "active"
              )}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span className="font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Connected Accounts */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Connected Accounts
        </h3>
        <div className="space-y-2">
          {socialAccounts.map((account: any) => (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className={cn(getPlatformIcon(account.platform), getPlatformColor(account.platform))}></i>
                <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {account.platform}
                </span>
                <span className="text-xs text-gray-400">
                  ({account.accountName})
                </span>
              </div>
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  account.isConnected ? "bg-green-500" : "bg-yellow-500"
                )}
              ></div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          onClick={() => setShowAccountModal(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Account
        </Button>
      </div>

      {/* Real OAuth Social Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connect Social Media Account
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAccountModal(false)}>
                <i className="fas fa-times"></i>
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Connect your real social media accounts to start posting and managing content across platforms.
            </p>
            
            <div className="space-y-3">
              {[
                { 
                  platform: "facebook", 
                  name: "Facebook",
                  description: "Connect Facebook Pages and personal profiles",
                  oauth: "https://www.facebook.com/v18.0/dialog/oauth"
                },
                { 
                  platform: "twitter", 
                  name: "Twitter/X",
                  description: "Connect your Twitter account for posting",
                  oauth: "https://twitter.com/i/oauth2/authorize"
                },
                { 
                  platform: "instagram", 
                  name: "Instagram",
                  description: "Connect Instagram Business accounts",
                  oauth: "https://api.instagram.com/oauth/authorize"
                },
                { 
                  platform: "linkedin", 
                  name: "LinkedIn",
                  description: "Connect LinkedIn Company Pages",
                  oauth: "https://www.linkedin.com/oauth/v2/authorization"
                },
                { 
                  platform: "youtube", 
                  name: "YouTube",
                  description: "Connect your YouTube channel",
                  oauth: "https://accounts.google.com/oauth2/v2/auth"
                },
                { 
                  platform: "tiktok", 
                  name: "TikTok",
                  description: "Connect TikTok Business accounts",
                  oauth: "https://www.tiktok.com/auth/authorize"
                }
              ].map((platform) => (
                <div
                  key={platform.platform}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPlatformColor(platform.platform).replace('text-', 'bg-').replace('-600', '-100 dark:bg-').replace('-100', '-900')}`}>
                        <i className={`${getPlatformIcon(platform.platform)} ${getPlatformColor(platform.platform)} text-lg`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{platform.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{platform.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Get client ID from environment or show configuration needed
                        const clientIds = {
                          facebook: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
                          twitter: import.meta.env.VITE_TWITTER_CLIENT_ID,
                          instagram: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
                          linkedin: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
                          youtube: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                          tiktok: import.meta.env.VITE_TIKTOK_CLIENT_ID,
                        };
                        
                        const clientId = clientIds[platform.platform as keyof typeof clientIds];
                        
                        // Check if client ID is configured
                        if (!clientId) {
                          // Show setup instructions for missing credentials
                          const setupWindow = window.open(
                            `/auth/callback/${platform.platform}?setup=true`, 
                            'oauth_setup', 
                            'width=800,height=700'
                          );
                          return;
                        }
                        
                        const redirectUri = `${window.location.origin}/auth/callback/${platform.platform}`;
                        const scope = platform.platform === "facebook" ? "pages_manage_posts,pages_read_engagement" :
                                     platform.platform === "twitter" ? "tweet.read,tweet.write,users.read" :
                                     platform.platform === "instagram" ? "instagram_basic,instagram_content_publish" :
                                     platform.platform === "linkedin" ? "w_member_social,r_liteprofile" :
                                     platform.platform === "youtube" ? "https://www.googleapis.com/auth/youtube.upload" :
                                     "user.info.basic,video.publish";
                        
                        const authUrl = `${platform.oauth}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${platform.platform}`;
                        
                        // Open OAuth in new window
                        const authWindow = window.open(authUrl, 'oauth', 'width=600,height=600');
                        
                        // Listen for OAuth completion
                        const checkClosed = setInterval(() => {
                          if (authWindow?.closed) {
                            clearInterval(checkClosed);
                            // Refresh to check for new connection
                            window.location.reload();
                          }
                        }, 1000);
                        
                        setShowAccountModal(false);
                      }}
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Before connecting:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Ensure you have admin access to the accounts you want to connect</li>
                    <li>For business accounts, you may need to create developer apps first</li>
                    <li>Some platforms require approval for posting permissions</li>
                    <li>You can disconnect accounts anytime from your settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
