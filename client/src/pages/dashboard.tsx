import AppLayout from "@/components/layout/app-layout";
import Header from "@/components/layout/header";
import QuickActions from "@/components/dashboard/quick-actions";
import AnalyticsOverview from "@/components/dashboard/analytics-overview";
import RecentActivity from "@/components/dashboard/recent-activity";
import UpcomingPosts from "@/components/dashboard/upcoming-posts";
import TopContent from "@/components/dashboard/top-content";
import ActiveAutomations from "@/components/dashboard/active-automations";
import PostComposer from "@/components/modals/post-composer";
import ScheduledPostsManager from "@/components/posts/scheduled-posts-manager";
import AccountManager from "@/components/social/account-manager";
import LiveAnalytics from "@/components/analytics/live-analytics";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <AppLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <Header 
          title="Dashboard" 
          subtitle="Welcome back! Here's what's happening with your social media." 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <QuickActions />
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <AnalyticsOverview />
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <RecentActivity />
                  <UpcomingPosts />
                </div>
              </div>

              <TopContent />
              <ActiveAutomations />
            </TabsContent>
            
            <TabsContent value="posts" className="mt-6">
              <ScheduledPostsManager />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <LiveAnalytics />
            </TabsContent>
            
            <TabsContent value="accounts" className="mt-6">
              <AccountManager />
            </TabsContent>
          </Tabs>
        </main>
        
        <PostComposer 
          isOpen={isComposerOpen} 
          onClose={() => setIsComposerOpen(false)} 
        />
      </div>
    </AppLayout>
  );
}
