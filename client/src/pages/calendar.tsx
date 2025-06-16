import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { getPlatformIcon, getPlatformColor, formatScheduledTime } from "@/lib/utils";
import type { Post } from "@shared/schema";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("month");
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, scheduledAt }: { postId: number; scheduledAt: Date }) => {
      return apiRequest(`/api/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify({ scheduledAt }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  // Calendar helper functions
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getPostsForDate = (date: Date) => {
    if (!date) return [];
    return posts.filter(post => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const handleDragStart = (e: React.DragEvent, post: Post) => {
    setDraggedPost(post);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedPost || !targetDate) return;

    const newScheduledAt = new Date(targetDate);
    if (draggedPost.scheduledAt) {
      const originalTime = new Date(draggedPost.scheduledAt);
      newScheduledAt.setHours(originalTime.getHours(), originalTime.getMinutes());
    } else {
      newScheduledAt.setHours(12, 0); // Default to noon
    }

    updatePostMutation.mutate({
      postId: draggedPost.id,
      scheduledAt: newScheduledAt,
    });

    setDraggedPost(null);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const renderPost = (post: Post) => (
    <div
      key={post.id}
      draggable
      onDragStart={(e) => handleDragStart(e, post)}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2 mb-1 cursor-move hover:shadow-md transition-shadow text-xs"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex space-x-1">
          {post.platforms.map((platform) => (
            <i
              key={platform}
              className={`${getPlatformIcon(platform)} ${getPlatformColor(platform)}`}
            />
          ))}
        </div>
        <Badge variant={post.status === "scheduled" ? "default" : post.status === "published" ? "secondary" : "outline"} className="text-xs px-1 py-0">
          {post.status}
        </Badge>
      </div>
      <p className="text-gray-900 dark:text-white truncate">
        {post.content.length > 40 ? `${post.content.substring(0, 40)}...` : post.content}
      </p>
      {post.scheduledAt && (
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
          {new Date(post.scheduledAt).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </p>
      )}
    </div>
  );

  const days = view === "month" ? getMonthDays() : getWeekDays();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Calendar</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Content Calendar</h1>
          <div className="flex items-center">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-full sm:w-auto">
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className="flex-1 sm:flex-none"
              >
                Week
              </Button>
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className="flex-1 sm:flex-none"
              >
                Month
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => view === "month" ? navigateMonth("prev") : navigateWeek("prev")}
                className="order-1 sm:order-none"
              >
                <i className="fas fa-chevron-left mr-2"></i>
                <span className="hidden sm:inline">{view === "month" ? "Previous Month" : "Previous Week"}</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center order-0 sm:order-none">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric',
                  ...(view === "week" && { day: 'numeric' })
                })}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => view === "month" ? navigateMonth("next") : navigateWeek("next")}
                className="order-2 sm:order-none"
              >
                <span className="hidden sm:inline">{view === "month" ? "Next Month" : "Next Week"}</span>
                <span className="sm:hidden">Next</span>
                <i className="fas fa-chevron-right ml-2"></i>
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2 sm:mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-1 sm:p-2 text-center font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.substring(0, 1)}</span>
                </div>
              ))}
            </div>

            <div className={`grid grid-cols-7 gap-1 ${view === "month" ? "auto-rows-fr" : ""}`}>
              {days.map((date, index) => (
                <div
                  key={index}
                  className={`
                    min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-200 dark:border-gray-700 
                    ${date ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}
                    ${date && date.toDateString() === new Date().toDateString() ? "ring-2 ring-blue-500" : ""}
                    ${date ? "hover:bg-gray-50 dark:hover:bg-gray-700" : ""}
                  `}
                  onDragOver={date ? handleDragOver : undefined}
                  onDrop={date ? (e) => handleDrop(e, date) : undefined}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          date.toDateString() === new Date().toDateString() 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-gray-900 dark:text-white"
                        }`}>
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {getPostsForDate(date).map(renderPost)}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unscheduled Posts */}
        {posts.filter(post => !post.scheduledAt).length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Unscheduled Posts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {posts
                  .filter(post => !post.scheduledAt)
                  .map(renderPost)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}