import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Edit, Trash2, Play, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Post {
  id: number;
  content: string;
  platforms: string[];
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  media: string[] | null;
  engagement: any;
}

export default function ScheduledPostsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts/upcoming"],
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Post> }) => {
      const response = await apiRequest("PATCH", `/api/posts/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingPost(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/posts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/posts/${id}/publish`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      const successCount = data.results.filter((r: any) => r.success).length;
      const totalCount = data.results.length;
      
      toast({
        title: "Publishing Complete",
        description: `Successfully published to ${successCount}/${totalCount} platforms`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive",
      });
    },
  });

  const handleEditPost = (post: Post) => {
    setEditingPost({ ...post });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingPost) return;
    
    updatePostMutation.mutate({
      id: editingPost.id,
      updates: {
        content: editingPost.content,
        scheduledAt: editingPost.scheduledAt,
        platforms: editingPost.platforms,
      },
    });
  };

  const handleDeletePost = (id: number) => {
    deletePostMutation.mutate(id);
  };

  const handlePublishNow = (id: number) => {
    publishPostMutation.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Scheduled Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Scheduled Posts</span>
            <Badge variant="secondary">{posts.length}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled posts</p>
            <p className="text-sm">Create your first scheduled post to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {post.content.slice(0, 100)}
                      {post.content.length > 100 && "..."}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Badge className={getStatusColor(post.status)}>
                        {post.status.replace('_', ' ')}
                      </Badge>
                      <span>•</span>
                      <span>{post.platforms.join(", ")}</span>
                      <span>•</span>
                      <span>{formatDate(post.scheduledAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPost(post)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePublishNow(post.id)}
                      disabled={publishPostMutation.isPending}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this scheduled post? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePost(post.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Post Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Scheduled Post</DialogTitle>
            </DialogHeader>
            {editingPost && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={editingPost.content}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, content: e.target.value })
                    }
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Scheduled Date</label>
                  <Input
                    type="datetime-local"
                    value={
                      editingPost.scheduledAt
                        ? new Date(editingPost.scheduledAt).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Platforms</label>
                  <div className="mt-1 space-y-2">
                    {["facebook", "twitter", "instagram", "linkedin"].map((platform) => (
                      <label key={platform} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingPost.platforms.includes(platform)}
                          onChange={(e) => {
                            const platforms = e.target.checked
                              ? [...editingPost.platforms, platform]
                              : editingPost.platforms.filter((p) => p !== platform);
                            setEditingPost({ ...editingPost, platforms });
                          }}
                        />
                        <span className="capitalize">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={updatePostMutation.isPending}
                  >
                    {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}