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
            <a
              className={cn(
                "sidebar-nav-item",
                location === item.path && "active"
              )}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span className="font-medium">{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>

      {/* Connected Accounts */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Connected Accounts
        </h3>
        <div className="space-y-2">
          {socialAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className={cn(getPlatformIcon(account.platform), getPlatformColor(account.platform))}></i>
                <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {account.platform}
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

      {/* Simple Social Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connect Social Account
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAccountModal(false)}>
                <i className="fas fa-times"></i>
              </Button>
            </div>
            
            <div className="space-y-3">
              {["facebook", "twitter", "instagram", "linkedin", "youtube", "tiktok"].map((platform) => (
                <Button
                  key={platform}
                  variant="outline"
                  className="w-full justify-start p-3"
                  onClick={() => {
                    // Create account with required schema fields
                    const newAccount = {
                      platform,
                      accountName: `demo_${platform}_user`,
                      accountId: `${platform}_${Date.now()}`,
                      accessToken: `token_${Date.now()}`,
                      isConnected: true,
                    };
                    
                    fetch("/api/social-accounts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newAccount),
                    }).then(() => {
                      window.location.reload(); // Simple refresh to update data
                    });
                    
                    setShowAccountModal(false);
                  }}
                >
                  <i className={`${getPlatformIcon(platform)} ${getPlatformColor(platform)} mr-3`}></i>
                  Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
