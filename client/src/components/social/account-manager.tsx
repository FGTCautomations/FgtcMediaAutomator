import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Settings, Trash2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SocialAccount {
  id: number;
  platform: string;
  accountName: string;
  accountId: string;
  isConnected: boolean;
  createdAt: string;
}

const platformColors = {
  facebook: "bg-blue-600",
  twitter: "bg-sky-500", 
  instagram: "bg-pink-600",
  linkedin: "bg-blue-700",
  youtube: "bg-red-600",
  tiktok: "bg-black"
};

export default function AccountManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: accounts = [], isLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/social-accounts"],
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, isConnected }: { id: number; isConnected: boolean }) => {
      const response = await apiRequest("PATCH", `/api/social-accounts/${id}`, { isConnected });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Account status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/social-accounts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Account removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove account",
        variant: "destructive",
      });
    },
  });

  const validateAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/social-accounts/${id}/validate`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({
        title: data.isValid ? "Connection Valid" : "Connection Invalid",
        description: data.message,
        variant: data.isValid ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to validate connection",
        variant: "destructive",
      });
    },
  });

  const handleToggleAccount = (id: number, isConnected: boolean) => {
    updateAccountMutation.mutate({ id, isConnected: !isConnected });
  };

  const handleDeleteAccount = (id: number) => {
    deleteAccountMutation.mutate(id);
  };

  const handleValidateAccount = (id: number) => {
    validateAccountMutation.mutate(id);
  };

  const handleAddAccount = (platform: string) => {
    window.open(`/auth/callback/${platform}?setup=true`, '_blank', 'width=600,height=700');
    setIsAddDialogOpen(false);
  };

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook', description: 'Connect your Facebook page for posting and analytics' },
    { id: 'twitter', name: 'Twitter', description: 'Share tweets and track engagement' },
    { id: 'instagram', name: 'Instagram', description: 'Post photos and stories to Instagram' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Share professional content on LinkedIn' },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Connected Accounts</span>
            <Badge variant="secondary">{accounts.filter(acc => acc.isConnected).length}</Badge>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Social Media Account</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePlatforms.map((platform) => {
                  const isConnected = accounts.some(acc => acc.platform === platform.id && acc.isConnected);
                  return (
                    <div
                      key={platform.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        isConnected ? 'bg-green-50 border-green-200' : ''
                      }`}
                      onClick={() => !isConnected && handleAddAccount(platform.id)}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${platformColors[platform.id as keyof typeof platformColors]} flex items-center justify-center text-white`}>
                          <span className="text-sm font-bold">{platform.name[0]}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{platform.name}</h3>
                          {isConnected && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No accounts connected</p>
            <p className="text-sm">Add your first social media account to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${platformColors[account.platform as keyof typeof platformColors]} flex items-center justify-center text-white`}>
                    <span className="text-sm font-bold">{account.platform[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium capitalize">{account.platform}</h3>
                      {account.isConnected ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{account.accountName}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleValidateAccount(account.id)}
                    disabled={validateAccountMutation.isPending}
                  >
                    <RefreshCw className={`w-4 h-4 ${validateAccountMutation.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                  <Switch
                    checked={account.isConnected}
                    onCheckedChange={() => handleToggleAccount(account.id, account.isConnected)}
                    disabled={updateAccountMutation.isPending}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this {account.platform} account? 
                          This will stop all scheduled posts to this platform.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAccount(account.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}