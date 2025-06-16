import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import type { Post, User } from "@shared/schema";

export default function Team() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("team_member");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<User[]>({
    queryKey: ["/api/team/members"],
  });

  const assignPostMutation = useMutation({
    mutationFn: async ({ postId, assignedToId }: { postId: number; assignedToId: number | null }) => {
      return apiRequest(`/api/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify({ assignedToId }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const approvePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/posts/${postId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      return apiRequest("/api/team/invite", {
        method: "POST",
        body: JSON.stringify({ email, role }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("team_member");
    },
  });

  const handleAssignPost = (postId: number, userId: number | null) => {
    assignPostMutation.mutate({ postId, assignedToId: userId });
  };

  const handleApprovePost = (postId: number) => {
    approvePostMutation.mutate(postId);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      inviteMemberMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "creator": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "viewer": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "pending_approval": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "published": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const pendingApprovalPosts = posts.filter(post => post.status === "pending_approval");
  const assignedPosts = posts.filter(post => post.assignedToId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-user-plus mr-2"></i>
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                      <SelectItem value="manager">Manager - Manage content & team</SelectItem>
                      <SelectItem value="creator">Creator - Create & edit content</SelectItem>
                      <SelectItem value="viewer">Viewer - View only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteMemberMutation.isPending}>
                    Send Invitation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="assignments">Post Assignments</TabsTrigger>
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={member.avatar || undefined} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getRoleColor(member.role)}>
                            {member.role.replace('_', ' ')}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-ellipsis-v"></i>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white mb-2">
                              {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                            </p>
                            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                              <Badge className={getStatusColor(post.status)}>
                                {post.status.replace('_', ' ')}
                              </Badge>
                              <span>Platforms: {post.platforms.join(', ')}</span>
                              {post.scheduledAt && (
                                <span>Scheduled: {new Date(post.scheduledAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Select
                              value={post.assignedToId?.toString() || "unassigned"}
                              onValueChange={(value) => 
                                handleAssignPost(post.id, value === "unassigned" ? null : parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Assign to..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {teamMembers.map((member) => (
                                  <SelectItem key={member.id} value={member.id.toString()}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals ({pendingApprovalPosts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApprovalPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-check-circle text-4xl text-green-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No posts are waiting for approval.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovalPosts.map((post) => (
                      <div key={post.id} className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white mb-2">
                              {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                            </p>
                            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <span>Platforms: {post.platforms.join(', ')}</span>
                              {post.assignedToId && (
                                <span>
                                  Assigned to: {teamMembers.find(m => m.id === post.assignedToId)?.name || 'Unknown'}
                                </span>
                              )}
                              {post.scheduledAt && (
                                <span>Scheduled: {new Date(post.scheduledAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // In a real app, this would open a detailed review modal
                                console.log("Review post", post.id);
                              }}
                            >
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprovePost(post.id)}
                              disabled={approvePostMutation.isPending}
                            >
                              <i className="fas fa-check mr-2"></i>
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}