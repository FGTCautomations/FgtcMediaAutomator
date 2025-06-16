import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatTimeAgo, formatScheduledTime } from "@/lib/utils";
import type { Automation } from "@shared/schema";

export default function ActiveAutomations() {
  const { data: automations = [], isLoading } = useQuery<Automation[]>({
    queryKey: ["/api/automations"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Automations</h2>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Automations</h2>
          <Link href="/automations">
            <Button className="bg-primary-600 hover:bg-primary-700">
              <i className="fas fa-plus mr-2"></i>Create Automation
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((automation) => (
            <div key={automation.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    automation.isActive 
                      ? "bg-green-100 dark:bg-green-900/20" 
                      : "bg-yellow-100 dark:bg-yellow-900/20"
                  }`}>
                    <i className={`${
                      automation.isActive ? "fas fa-robot text-green-600 dark:text-green-400" : "fas fa-pause text-yellow-600 dark:text-yellow-400"
                    } text-sm`}></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {automation.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    automation.isActive ? "bg-green-500" : "bg-yellow-500"
                  }`}></div>
                  <span className={`text-xs ${
                    automation.isActive 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}>
                    {automation.isActive ? "Active" : "Paused"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {automation.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Triggered {automation.triggerCount} times</span>
                <span>
                  {automation.lastRun 
                    ? `Last run: ${formatTimeAgo(new Date(automation.lastRun))}` 
                    : automation.nextRun 
                      ? `Next run: ${formatScheduledTime(new Date(automation.nextRun))}`
                      : "Never run"
                  }
                </span>
              </div>
            </div>
          ))}
          {automations.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No automations created yet
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
