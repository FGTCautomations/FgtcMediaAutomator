import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";

export default function Team() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Team" 
          subtitle="Manage team members and collaboration settings" 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Team Management
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Team management features coming soon. Invite and manage team members here.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
