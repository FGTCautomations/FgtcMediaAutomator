import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import QuickActions from "@/components/dashboard/quick-actions";
import AnalyticsOverview from "@/components/dashboard/analytics-overview";
import RecentActivity from "@/components/dashboard/recent-activity";
import UpcomingPosts from "@/components/dashboard/upcoming-posts";
import TopContent from "@/components/dashboard/top-content";
import ActiveAutomations from "@/components/dashboard/active-automations";
import PostComposer from "@/components/modals/post-composer";
import { useState } from "react";

export default function Dashboard() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          subtitle="Welcome back! Here's what's happening with your social media." 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <QuickActions />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
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
        </main>
      </div>

      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
      />
    </div>
  );
}
