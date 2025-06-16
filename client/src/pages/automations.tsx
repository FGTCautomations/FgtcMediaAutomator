import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ActiveAutomations from "@/components/dashboard/active-automations";

export default function Automations() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Automations" 
          subtitle="Set up and manage your social media automation workflows" 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <ActiveAutomations />
        </main>
      </div>
    </div>
  );
}
