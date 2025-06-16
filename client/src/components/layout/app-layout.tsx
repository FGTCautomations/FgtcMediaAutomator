import { ReactNode } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";

interface AppLayoutProps {
  children: ReactNode;
}

const getPageTitle = (path: string): string => {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/calendar": "Calendar",
    "/compose": "Compose",
    "/analytics": "Analytics", 
    "/automations": "Automations",
    "/content-library": "Content Library",
    "/content-management": "Content Management",
    "/team": "Team"
  };
  return titles[path] || "Social Media Manager";
};

const getPageSubtitle = (path: string): string => {
  const subtitles: Record<string, string> = {
    "/": "Welcome back! Here's what's happening with your social media.",
    "/calendar": "Schedule and manage your content calendar",
    "/compose": "Create and edit your social media posts",
    "/analytics": "Track your performance and engagement",
    "/automations": "Manage your automated workflows",
    "/content-library": "Organize your media and content templates",
    "/content-management": "Manage and review your content",
    "/team": "Collaborate with your team members"
  };
  return subtitles[path] || "";
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <Sidebar className="hidden md:flex" />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header 
          title={getPageTitle(location)}
          subtitle={getPageSubtitle(location)}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}