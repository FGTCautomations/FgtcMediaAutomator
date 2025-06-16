import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Filter, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { format } from "date-fns";
import type { Analytics as AnalyticsType } from "@shared/schema";

export default function Analytics() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [metricType, setMetricType] = useState<string>("engagement");
  const [timeFrame, setTimeFrame] = useState<string>("30d");

  const { data: analytics = [], isLoading } = useQuery<AnalyticsType[]>({
    queryKey: ["/api/analytics", selectedPlatform !== "all" ? selectedPlatform : undefined],
  });

  const { data: summary } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  const platforms = [
    { value: "all", label: "All Platforms" },
    { value: "facebook", label: "Facebook" },
    { value: "twitter", label: "Twitter" },
    { value: "instagram", label: "Instagram" },
    { value: "linkedin", label: "LinkedIn" },
  ];

  const timeFrames = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" },
    { value: "custom", label: "Custom range" },
  ];

  const metrics = [
    { value: "engagement", label: "Engagement Rate", icon: "fas fa-heart" },
    { value: "reach", label: "Reach", icon: "fas fa-eye" },
    { value: "followers", label: "Followers Growth", icon: "fas fa-users" },
    { value: "posts", label: "Post Performance", icon: "fas fa-chart-bar" },
  ];

  const mockPlatformData = [
    {
      platform: "Facebook",
      followers: 15420,
      engagement: 4.2,
      reach: 125300,
      posts: 42,
      growth: 12.5,
      color: "bg-blue-600",
      icon: "fab fa-facebook-f"
    },
    {
      platform: "Instagram", 
      followers: 23100,
      engagement: 6.8,
      reach: 198450,
      posts: 67,
      growth: 18.3,
      color: "bg-pink-600",
      icon: "fab fa-instagram"
    },
    {
      platform: "Twitter",
      followers: 8950,
      engagement: 3.1,
      reach: 89200,
      posts: 156,
      growth: -2.1,
      color: "bg-sky-500",
      icon: "fab fa-twitter"
    },
    {
      platform: "LinkedIn",
      followers: 5670,
      engagement: 5.4,
      reach: 45300,
      posts: 28,
      growth: 8.7,
      color: "bg-blue-700",
      icon: "fab fa-linkedin-in"
    }
  ];

  const topPosts = [
    {
      id: 1,
      content: "Exciting news about our latest product launch! 🚀",
      platform: "Instagram",
      engagement: 847,
      reach: 12450,
      likes: 523,
      shares: 89,
      comments: 45,
      date: "2024-01-15"
    },
    {
      id: 2,
      content: "Behind the scenes of our creative process...",
      platform: "Facebook",
      engagement: 692,
      reach: 9800,
      likes: 421,
      shares: 156,
      comments: 67,
      date: "2024-01-12"
    },
    {
      id: 3,
      content: "Industry insights: The future of social media automation",
      platform: "LinkedIn",
      engagement: 589,
      reach: 7650,
      likes: 234,
      shares: 98,
      comments: 43,
      date: "2024-01-10"
    }
  ];

  const exportData = () => {
    const data = {
      summary,
      analytics,
      platforms: mockPlatformData,
      dateRange,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your social media performance across all platforms</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time frame" />
            </SelectTrigger>
            <SelectContent>
              {timeFrames.map((frame) => (
                <SelectItem key={frame.value} value={frame.value}>
                  {frame.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {timeFrame === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-60">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
          
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const value = metric.value === "engagement" ? summary?.engagementRate || 0 :
                       metric.value === "reach" ? 458950 :
                       metric.value === "followers" ? summary?.totalFollowers || 53140 :
                       293;
          
          const change = Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 1 : -(Math.floor(Math.random() * 10) + 1);
          
          return (
            <Card key={metric.value}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value === "engagement" ? `${value}%` : 
                       metric.value === "followers" ? value.toLocaleString() :
                       value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    metric.value === "engagement" ? "bg-green-100 dark:bg-green-900/20" :
                    metric.value === "reach" ? "bg-blue-100 dark:bg-blue-900/20" :
                    metric.value === "followers" ? "bg-purple-100 dark:bg-purple-900/20" :
                    "bg-orange-100 dark:bg-orange-900/20"
                  }`}>
                    <i className={`${metric.icon} ${
                      metric.value === "engagement" ? "text-green-600 dark:text-green-400" :
                      metric.value === "reach" ? "text-blue-600 dark:text-blue-400" :
                      metric.value === "followers" ? "text-purple-600 dark:text-purple-400" :
                      "text-orange-600 dark:text-orange-400"
                    }`}></i>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    change > 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {change > 0 ? "+" : ""}{change}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    vs last period
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends & Growth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="platforms" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockPlatformData.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <i className={`${platform.icon} text-white`}></i>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.platform}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {platform.followers.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <Badge variant={platform.growth > 0 ? "default" : "destructive"}>
                      {platform.growth > 0 ? "+" : ""}{platform.growth}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                      <p className="text-lg font-semibold">{platform.engagement}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reach</p>
                      <p className="text-lg font-semibold">{platform.reach.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
                      <p className="text-lg font-semibold">{platform.posts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post) => (
                  <div key={post.id} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <Badge variant="outline">{post.platform}</Badge>
                        <span>📅 {post.date}</span>
                        <span>👁️ {post.reach.toLocaleString()} reach</span>
                        <span>❤️ {post.likes} likes</span>
                        <span>🔄 {post.shares} shares</span>
                        <span>💬 {post.comments} comments</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {post.engagement}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        total engagement
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audience" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Age 18-24</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "28%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Age 25-34</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Age 35-44</span>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "22%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Age 45+</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { country: "United States", percentage: 42 },
                    { country: "United Kingdom", percentage: 18 },
                    { country: "Canada", percentage: 12 },
                    { country: "Australia", percentage: 8 },
                    { country: "Germany", percentage: 6 },
                    { country: "Others", percentage: 14 }
                  ].map((location) => (
                    <div key={location.country} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {location.country}
                      </span>
                      <span className="text-sm font-medium">
                        {location.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                  <p>Advanced chart visualization would be displayed here</p>
                  <p className="text-sm">Showing follower growth, engagement trends, and performance metrics over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
