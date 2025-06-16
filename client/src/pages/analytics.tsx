import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AnalyticsOverview from "@/components/dashboard/analytics-overview";

export default function Analytics() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Analytics" 
          subtitle="Track your social media performance and engagement" 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6">
            <AnalyticsOverview />
          </div>
        </main>
      </div>
    </div>
  );
}
