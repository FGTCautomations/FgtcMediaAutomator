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
import AdminPanel from "@/components/admin-panel";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const handleSwitchToAccountsTab = () => {
      setActiveTab("accounts");
    };

    window.addEventListener('switchToAccountsTab', handleSwitchToAccountsTab);
    return () => {
      window.removeEventListener('switchToAccountsTab', handleSwitchToAccountsTab);
    };
  }, []);

  return (
    <div className="space-y-6">
      <QuickActions />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="analytics">Live Analytics</TabsTrigger>
          <TabsTrigger value="accounts">Social Accounts</TabsTrigger>
          <TabsTrigger value="admin">Admin Panel</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="lg:col-span-2 xl:col-span-2 space-y-6">
              <AnalyticsOverview />
              <RecentActivity />
            </div>
            <div className="space-y-6">
              <UpcomingPosts />
              <TopContent />
              <ActiveAutomations />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="scheduled" className="mt-6">
          <ScheduledPostsManager />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <LiveAnalytics />
        </TabsContent>
        
        <TabsContent value="accounts" className="mt-6">
          <AccountManager />
        </TabsContent>
        
        <TabsContent value="admin" className="mt-6">
          <AdminPanel />
        </TabsContent>
      </Tabs>
      
      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
      />
    </div>
  );
}