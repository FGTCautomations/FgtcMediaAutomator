import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getPlatformIcon, getPlatformColor } from "@/lib/utils";

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
}

const platforms = [
  { id: "facebook", name: "Facebook" },
  { id: "twitter", name: "Twitter" },
  { id: "instagram", name: "Instagram" },
  { id: "linkedin", name: "LinkedIn" },
];

export default function PostComposer({ isOpen, onClose }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      platforms: string[];
      status: string;
      scheduledAt?: string;
    }) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: scheduleType === "now" ? "Post published successfully!" : "Post scheduled successfully!",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter post content.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    const postData: any = {
      content: content.trim(),
      platforms: selectedPlatforms,
      status: scheduleType === "now" ? "published" : "scheduled",
    };

    if (scheduleType === "later" && scheduledDate && scheduledTime) {
      postData.scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    createPostMutation.mutate(postData);
  };

  const handleClose = () => {
    setContent("");
    setSelectedPlatforms([]);
    setScheduleType("now");
    setScheduledDate("");
    setScheduledTime("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Post</h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <i className="fas fa-times text-xl"></i>
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Platform Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Select Platforms
            </label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`flex items-center space-x-2 ${
                    selectedPlatforms.includes(platform.id)
                      ? "bg-primary-600 hover:bg-primary-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <i className={`${getPlatformIcon(platform.id)} ${
                    selectedPlatforms.includes(platform.id) 
                      ? "text-white" 
                      : getPlatformColor(platform.id)
                  }`}></i>
                  <span>{platform.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Post Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
              placeholder="What's on your mind?"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {content.length}/280 characters
              </span>
              <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400">
                <i className="fas fa-magic mr-1"></i>AI Enhance
              </Button>
            </div>
          </div>

          {/* Media Upload */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Add Media
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop files here or click to browse
              </p>
              <Button className="mt-2" variant="outline">
                Choose Files
              </Button>
            </div>
          </div>

          {/* Scheduling Options */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Schedule
            </label>
            <div className="flex space-x-3 mb-4">
              <Button
                variant={scheduleType === "now" ? "default" : "outline"}
                size="sm"
                onClick={() => setScheduleType("now")}
              >
                Post Now
              </Button>
              <Button
                variant={scheduleType === "later" ? "default" : "outline"}
                size="sm"
                onClick={() => setScheduleType("later")}
              >
                Schedule Later
              </Button>
            </div>
            
            {scheduleType === "later" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm">
                <i className="fas fa-save mr-1"></i>Save Draft
              </Button>
              <Button variant="ghost" size="sm">
                <i className="fas fa-eye mr-1"></i>Preview
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createPostMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {createPostMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : null}
                {scheduleType === "now" ? "Publish" : "Schedule"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
