import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, Heart, Share, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LiveAnalytics {
  platform: string;
  followers: number;
  engagement: number;
  reach: number;
  posts: number;
  metrics?: Record<string, any>;
}

const platformColors = {
  facebook: "text-blue-600",
  twitter: "text-sky-500",
  instagram: "text-pink-600", 
  linkedin: "text-blue-700",
  youtube: "text-red-600",
  tiktok: "text-gray-900"
};

export default function LiveAnalytics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const { data: analytics = [], isLoading, refetch } = useQuery<LiveAnalytics[]>({
    queryKey: ["/api/analytics/live", selectedPlatform === "all" ? undefined : selectedPlatform],
    refetchInterval: 5 * 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/analytics/refresh");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/live"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Analytics Refreshed",
        description: "Live analytics data has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refresh analytics",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (value < threshold) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const filteredAnalytics = selectedPlatform === "all" 
    ? analytics 
    : analytics.filter(a => a.platform === selectedPlatform);

  const totalMetrics = analytics.reduce(
    (acc, curr) => ({
      followers: acc.followers + curr.followers,
      engagement: acc.engagement + curr.engagement,
      reach: acc.reach + curr.reach,
      posts: acc.posts + curr.posts,
    }),
    { followers: 0, engagement: 0, reach: 0, posts: 0 }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Analytics</CardTitle>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Followers</p>
                <p className="text-2xl font-bold">{formatNumber(totalMetrics.followers)}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(totalMetrics.followers, 1000)}
              <span className="text-xs text-muted-foreground ml-1">
                Across {analytics.length} platforms
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{(totalMetrics.engagement / Math.max(analytics.length, 1)).toFixed(1)}%</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(totalMetrics.engagement, 50)}
              <span className="text-xs text-muted-foreground ml-1">
                Average across platforms
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold">{formatNumber(totalMetrics.reach)}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(totalMetrics.reach, 5000)}
              <span className="text-xs text-muted-foreground ml-1">
                This month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{totalMetrics.posts}</p>
              </div>
              <Share className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(totalMetrics.posts, 10)}
              <span className="text-xs text-muted-foreground ml-1">
                This month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Platform Analytics</span>
            <div className="flex items-center space-x-2">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {Array.from(new Set(analytics.map(a => a.platform))).map(platform => (
                    <SelectItem key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
              >
                <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAnalytics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No analytics data available</p>
              <p className="text-sm">Connect social media accounts to see analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnalytics.map((platform) => (
                <div
                  key={platform.platform}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className={`${platformColors[platform.platform as keyof typeof platformColors]} text-lg font-bold`}>
                        {platform.platform[0].toUpperCase()}
                      </span>
                      <span className="font-medium capitalize">{platform.platform}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-8 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Followers</p>
                      <p className="text-lg font-semibold">{formatNumber(platform.followers)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                      <p className="text-lg font-semibold">{platform.engagement}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reach</p>
                      <p className="text-lg font-semibold">{formatNumber(platform.reach)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Posts</p>
                      <p className="text-lg font-semibold">{platform.posts}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}