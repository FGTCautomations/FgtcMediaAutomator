import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: "fas fa-chart-line" },
  { path: "/calendar", label: "Content Calendar", icon: "fas fa-calendar-alt" },
  { path: "/compose", label: "Compose", icon: "fas fa-edit" },
  { path: "/analytics", label: "Analytics", icon: "fas fa-chart-bar" },
  { path: "/automations", label: "Automations", icon: "fas fa-cog" },
  { path: "/content-library", label: "Content Library", icon: "fas fa-folder" },
  { path: "/content-management", label: "Content Management", icon: "fas fa-layer-group" },
  { path: "/team", label: "Team", icon: "fas fa-users" },
];

export default function MobileNav() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <i className="fas fa-bars text-lg"></i>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Logo & Brand */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-rocket text-white text-lg"></i>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">FGTC</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Social Automations</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start space-x-3 h-11",
                        isActive 
                          ? "bg-primary-500 text-white" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <i className={`${item.icon} text-sm w-4`}></i>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    User Account
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    user@example.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}