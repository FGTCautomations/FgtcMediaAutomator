import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPercentage } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface AnalyticsSummary {
  totalFollowers: number;
  engagementRate: number;
  postsThisMonth: number;
  reachThisMonth: number;
}

export default function AnalyticsOverview() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  
  const { data: summary, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics/summary"],
  });

  useEffect(() => {
    if (chartRef.current && typeof window !== 'undefined') {
      // Dynamically import Chart.js to avoid SSR issues
      import('chart.js/auto').then((Chart) => {
        const ctx = chartRef.current;
        if (!ctx) return;

        // Destroy existing chart if it exists
        const existingChart = Chart.Chart.getChart(ctx);
        if (existingChart) {
          existingChart.destroy();
        }

        new Chart.Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
              label: 'Engagement Rate',
              data: [3.2, 3.8, 4.1, 3.9, 4.3, 4.8, 5.1, 4.9, 5.3, 5.0, 4.8, 5.2],
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 6,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            }
          }
        });
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="lg:col-span-2">
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400">Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Followers",
      value: formatNumber(summary.totalFollowers),
      change: "+12.5% from last month",
      changeType: "positive",
      icon: "fas fa-users",
      color: "blue",
    },
    {
      label: "Engagement Rate",
      value: formatPercentage(summary.engagementRate),
      change: "+0.3% from last week",
      changeType: "positive",
      icon: "fas fa-heart",
      color: "green",
    },
    {
      label: "Posts This Month",
      value: summary.postsThisMonth.toString(),
      change: "-2 from target",
      changeType: "negative",
      icon: "fas fa-file-alt",
      color: "purple",
    },
  ];

  return (
    <div className="lg:col-span-2">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === "positive" 
                      ? "text-green-500" 
                      : "text-yellow-500"
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center`}>
                  <i className={`${stat.icon} text-${stat.color}-600 dark:text-${stat.color}-400`}></i>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Engagement Over Time</h3>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64">
            <canvas ref={chartRef} className="w-full h-full"></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
