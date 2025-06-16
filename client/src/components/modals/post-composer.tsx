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
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch connected social accounts
  const { data: socialAccounts = [] } = useQuery({
    queryKey: ["/api/social-accounts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/social-accounts");
      return response.json();
    },
  });

  // AI Post Improvement Mutation
  const improvePostMutation = useMutation({
    mutationFn: async () => {
      if (!content.trim()) throw new Error("No content to improve");
      const response = await apiRequest("POST", "/api/ai/improve-post", {
        content: content.trim(),
        platforms: selectedPlatforms,
        targetAudience: "general"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiSuggestions(data);
      setOriginalContent(content);
      setShowAiPanel(true);
      toast({
        title: "AI Analysis Complete",
        description: "Post improvement suggestions are ready!",
      });
    },
    onError: () => {
      toast({
        title: "AI Enhancement Failed",
        description: "Unable to generate improvements. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleAiEnhance = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content first.",
        variant: "destructive",
      });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform for AI optimization.",
        variant: "destructive",
      });
      return;
    }
    improvePostMutation.mutate();
  };

  const applyAiSuggestion = () => {
    if (aiSuggestions?.improvedContent) {
      setContent(aiSuggestions.improvedContent);
      setShowAiPanel(false);
      toast({
        title: "Applied",
        description: "AI improvements have been applied to your post.",
      });
    }
  };

  const handleClose = () => {
    setContent("");
    setOriginalContent("");
    setSelectedPlatforms([]);
    setScheduleType("now");
    setScheduledDate("");
    setScheduledTime("");
    setAiSuggestions(null);
    setShowAiPanel(false);
    onClose();
  };

  // Get available platforms from connected accounts
  const connectedPlatforms = socialAccounts.filter((account: any) => account.isConnected);
  const availablePlatforms = platforms.filter((platform: any) => 
    connectedPlatforms.some((account: any) => account.platform === platform.id)
  );

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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Platforms ({availablePlatforms.length} connected)
              </label>
              {availablePlatforms.length === 0 && (
                <Badge variant="outline" className="text-xs">
                  No accounts connected
                </Badge>
              )}
            </div>
            {availablePlatforms.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availablePlatforms.map((platform) => {
                  const account = connectedPlatforms.find((acc: any) => acc.platform === platform.id);
                  return (
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
                      {account?.username && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          @{account.username}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <i className="fas fa-link text-gray-400 text-2xl mb-2"></i>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Connect your social media accounts to start posting
                </p>
                <Button variant="outline" size="sm">
                  <i className="fas fa-plus mr-2"></i>Connect Accounts
                </Button>
              </div>
            )}
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-600 dark:text-primary-400"
                onClick={handleAiEnhance}
                disabled={improvePostMutation.isPending}
              >
                {improvePostMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                ) : (
                  <i className="fas fa-magic mr-1"></i>
                )}
                AI Enhance
              </Button>
            </div>

            {/* AI Enhancement Panel */}
            {showAiPanel && aiSuggestions && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    <i className="fas fa-robot mr-2"></i>AI Suggestions
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Score: {aiSuggestions.engagement_score}/100
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setShowAiPanel(false)}>
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Improved Content */}
                  <div>
                    <label className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 block">
                      Improved Content:
                    </label>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                      {aiSuggestions.improvedContent}
                    </div>
                  </div>

                  {/* Suggested Hashtags */}
                  {aiSuggestions.hashtags && aiSuggestions.hashtags.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 block">
                        Suggested Hashtags:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.hashtags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions List */}
                  {aiSuggestions.suggestions && aiSuggestions.suggestions.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1 block">
                        Recommendations:
                      </label>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        {aiSuggestions.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <i className="fas fa-check-circle mt-0.5 mr-2 text-green-500"></i>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setContent(originalContent)}
                    >
                      Revert to Original
                    </Button>
                    <Button
                      size="sm"
                      onClick={applyAiSuggestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Apply Improvements
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
