import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getPlatformIcon, getPlatformColor } from "@/lib/utils";

interface SocialAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const platforms = [
  { 
    id: "facebook", 
    name: "Facebook", 
    description: "Connect your Facebook pages and profiles",
    authUrl: "https://facebook.com/oauth",
    fields: [
      { key: "pageId", label: "Page ID", placeholder: "Your Facebook page ID" },
      { key: "accessToken", label: "Access Token", placeholder: "Your Facebook access token", type: "password" }
    ]
  },
  { 
    id: "twitter", 
    name: "Twitter", 
    description: "Connect your Twitter account",
    authUrl: "https://twitter.com/oauth",
    fields: [
      { key: "username", label: "Username", placeholder: "@username" },
      { key: "accessToken", label: "Access Token", placeholder: "Your Twitter access token", type: "password" },
      { key: "accessTokenSecret", label: "Access Token Secret", placeholder: "Token secret", type: "password" }
    ]
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    description: "Connect your Instagram business account",
    authUrl: "https://instagram.com/oauth",
    fields: [
      { key: "username", label: "Username", placeholder: "@username" },
      { key: "accessToken", label: "Access Token", placeholder: "Instagram access token", type: "password" }
    ]
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    description: "Connect your LinkedIn company page",
    authUrl: "https://linkedin.com/oauth",
    fields: [
      { key: "companyId", label: "Company ID", placeholder: "LinkedIn company ID" },
      { key: "accessToken", label: "Access Token", placeholder: "LinkedIn access token", type: "password" }
    ]
  },
  { 
    id: "youtube", 
    name: "YouTube", 
    description: "Connect your YouTube channel",
    authUrl: "https://youtube.com/oauth",
    fields: [
      { key: "channelId", label: "Channel ID", placeholder: "Your YouTube channel ID" },
      { key: "accessToken", label: "Access Token", placeholder: "YouTube access token", type: "password" }
    ]
  },
  { 
    id: "tiktok", 
    name: "TikTok", 
    description: "Connect your TikTok business account",
    authUrl: "https://tiktok.com/oauth",
    fields: [
      { key: "username", label: "Username", placeholder: "@username" },
      { key: "accessToken", label: "Access Token", placeholder: "TikTok access token", type: "password" }
    ]
  }
];

export default function SocialAccountModal({ isOpen, onClose }: SocialAccountModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"select" | "connect">("select");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/social-accounts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({
        title: "Account Connected",
        description: "Your social media account has been successfully connected!",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect your account. Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setFormData({});
    setStep("connect");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = () => {
    const platform = platforms.find(p => p.id === selectedPlatform);
    if (!platform) return;

    // Validate required fields
    const missingFields = platform.fields.filter(field => !formData[field.key]?.trim());
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.map(f => f.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const accountData = {
      platform: selectedPlatform,
      username: formData.username || formData.pageId || formData.channelId || formData.companyId || `${selectedPlatform}_user`,
      accessToken: formData.accessToken,
      isConnected: true,
      ...formData
    };

    connectAccountMutation.mutate(accountData);
  };

  const handleOAuthConnect = (platformId: string) => {
    // Simulate OAuth flow
    toast({
      title: "OAuth Flow",
      description: "Redirecting to platform authentication...",
    });
    
    // In a real app, this would redirect to the OAuth provider
    setTimeout(() => {
      const accountData = {
        platform: platformId,
        username: `demo_${platformId}_user`,
        accessToken: `oauth_token_${Date.now()}`,
        isConnected: true,
      };
      connectAccountMutation.mutate(accountData);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedPlatform(null);
    setFormData({});
    setStep("select");
    onClose();
  };

  if (!isOpen) return null;

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {step === "select" ? "Connect Social Media Account" : `Connect ${selectedPlatformData?.name}`}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {step === "select" 
                  ? "Choose a platform to connect your social media account" 
                  : "Enter your account credentials to establish the connection"
                }
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <i className="fas fa-times text-xl"></i>
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {step === "select" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-colors"
                  onClick={() => handlePlatformSelect(platform.id)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPlatformColor(platform.id).replace('text-', 'bg-').replace('-600', '-100 dark:bg-').replace('-100', '-900')}`}>
                      <i className={`${getPlatformIcon(platform.id)} ${getPlatformColor(platform.id)} text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{platform.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {platform.fields.length} fields required
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {platform.description}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOAuthConnect(platform.id);
                      }}
                    >
                      <i className="fas fa-link mr-2"></i>
                      Quick Connect
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlatformSelect(platform.id);
                      }}
                    >
                      Manual Setup
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedPlatformData ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getPlatformColor(selectedPlatform!).replace('text-', 'bg-').replace('-600', '-100 dark:bg-').replace('-100', '-900')}`}>
                  <i className={`${getPlatformIcon(selectedPlatform!)} ${getPlatformColor(selectedPlatform!)} text-xl`}></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{selectedPlatformData.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPlatformData.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedPlatformData.fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      {field.label}
                    </label>
                    <Input
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-0.5"></i>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">How to get your credentials:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Go to {selectedPlatformData.name} Developer Portal</li>
                      <li>Create a new app or use existing one</li>
                      <li>Generate access tokens with required permissions</li>
                      <li>Copy the credentials and paste them above</li>
                    </ol>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-blue-600 dark:text-blue-400 mt-2"
                      onClick={() => window.open(selectedPlatformData.authUrl, '_blank')}
                    >
                      Open Developer Portal <i className="fas fa-external-link-alt ml-1"></i>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Platforms
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConnect}
                    disabled={connectAccountMutation.isPending}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {connectAccountMutation.isPending ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-link mr-2"></i>
                    )}
                    Connect Account
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}