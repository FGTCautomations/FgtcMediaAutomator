import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlatformIcon, getPlatformColor, formatTimeAgo } from "@/lib/utils";
import type { Post } from "@shared/schema";

export default function TopContent() {
  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/top-performing"],
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Content</h2>
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Content</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-md">
              This Week
            </button>
            <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md">
              This Month
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Content</th>
                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Platform</th>
                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Engagement</th>
                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Reach</th>
                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Performance</th>
              </tr>
            </thead>
            <tbody className="space-y-3">
              {posts.map((post) => {
                const engagement = post.engagement as any;
                const reach = engagement?.reach || 0;
                const likes = engagement?.likes || 0;
                const performance = reach > 0 ? Math.min((likes / reach) * 1000, 100) : 0;
                
                return (
                  <tr key={post.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <i className="fas fa-file-alt text-gray-500 dark:text-gray-400"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.content.length > 30 
                              ? `${post.content.substring(0, 30)}...` 
                              : post.content
                            }
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Posted {post.publishedAt ? formatTimeAgo(new Date(post.publishedAt)) : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        {post.platforms.map((platform) => (
                          <i
                            key={platform}
                            className={`${getPlatformIcon(platform)} ${getPlatformColor(platform)}`}
                          ></i>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {likes.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {reach.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${performance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-green-500 font-medium">
                          {Math.round(performance)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No published posts with engagement data yet
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
