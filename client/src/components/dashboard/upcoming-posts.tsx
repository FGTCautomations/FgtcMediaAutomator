import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getPlatformIcon, getPlatformColor, formatScheduledTime } from "@/lib/utils";
import type { Post } from "@shared/schema";

export default function UpcomingPosts() {
  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/upcoming"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Posts</h3>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Posts</h3>
          <Link href="/calendar">
            <a className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700 dark:hover:text-primary-300">
              <i className="fas fa-calendar-alt mr-1"></i>Calendar
            </a>
          </Link>
        </div>
        <div className="space-y-4">
          {posts.slice(0, 2).map((post) => (
            <div key={post.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex space-x-1">
                  {post.platforms.map((platform) => (
                    <i
                      key={platform}
                      className={`${getPlatformIcon(platform)} ${getPlatformColor(platform)} text-sm`}
                    ></i>
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {post.content.length > 50 
                      ? `${post.content.substring(0, 50)}...` 
                      : post.content
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {post.scheduledAt ? formatScheduledTime(new Date(post.scheduledAt)) : "No schedule"}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <i className="fas fa-ellipsis-h text-sm"></i>
                </Button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No upcoming posts scheduled
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
