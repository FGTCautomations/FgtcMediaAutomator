import {
  users,
  socialAccounts,
  posts,
  automations,
  analytics,
  contentLibrary,
  activities,
  type User,
  type InsertUser,
  type SocialAccount,
  type InsertSocialAccount,
  type Post,
  type InsertPost,
  type Automation,
  type InsertAutomation,
  type Analytics,
  type InsertAnalytics,
  type ContentLibrary,
  type InsertContentLibrary,
  type Activity,
  type InsertActivity,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Social Accounts
  getSocialAccounts(userId: number): Promise<SocialAccount[]>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccountStatus(id: number, isConnected: boolean): Promise<void>;
  deleteSocialAccount(id: number): Promise<void>;

  // Posts
  getPosts(userId: number): Promise<Post[]>;
  getPostsByStatus(userId: number, status: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;
  getUpcomingPosts(userId: number): Promise<Post[]>;
  getTopPerformingPosts(userId: number, limit?: number): Promise<Post[]>;

  // Automations
  getAutomations(userId: number): Promise<Automation[]>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(id: number, updates: Partial<Automation>): Promise<Automation | undefined>;
  toggleAutomation(id: number): Promise<void>;

  // Analytics
  getAnalytics(userId: number, platform?: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsSummary(userId: number): Promise<{
    totalFollowers: number;
    engagementRate: number;
    postsThisMonth: number;
    reachThisMonth: number;
  }>;

  // Content Library
  getContentLibrary(userId: number): Promise<ContentLibrary[]>;
  createContentLibraryItem(item: InsertContentLibrary): Promise<ContentLibrary>;

  // Activities
  getRecentActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private socialAccounts: Map<number, SocialAccount> = new Map();
  private posts: Map<number, Post> = new Map();
  private automations: Map<number, Automation> = new Map();
  private analytics: Map<number, Analytics> = new Map();
  private contentLibrary: Map<number, ContentLibrary> = new Map();
  private activities: Map<number, Activity> = new Map();
  private currentUserId = 1;
  private currentSocialAccountId = 1;
  private currentPostId = 1;
  private currentAutomationId = 1;
  private currentAnalyticsId = 1;
  private currentContentLibraryId = 1;
  private currentActivityId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const user: User = {
      id: 1,
      email: "john@example.com",
      name: "John Doe",
      avatar: null,
      supabaseId: null,
      role: "admin",
      currentWorkspaceId: null,
      createdAt: new Date(),
    };
    this.users.set(1, user);
    this.currentUserId = 2;

    // Start with no social accounts - users must connect real ones
    this.currentSocialAccountId = 1;

    // Create sample posts
    const postsData = [
      {
        content: "New Product Launch Post - Exciting announcement about our latest innovation!",
        platforms: ["facebook", "instagram"],
        status: "published",
        engagement: { likes: 324, shares: 45, comments: 28, reach: 12450 },
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        content: "Behind the Scenes Video - Take a look at our amazing team in action!",
        platforms: ["youtube", "twitter"],
        status: "published",
        engagement: { likes: 189, shares: 32, comments: 15, reach: 8320 },
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        content: "Product launch announcement with detailed features and benefits",
        platforms: ["facebook", "twitter"],
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      },
      {
        content: "Weekly industry insights post for our LinkedIn audience",
        platforms: ["linkedin"],
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      },
    ];

    postsData.forEach((post, index) => {
      const postData: Post = {
        id: index + 1,
        userId: 1,
        categoryId: null,
        assignedToId: null,
        content: post.content,
        media: null,
        platforms: post.platforms,
        status: post.status,
        scheduledAt: post.scheduledAt || null,
        publishedAt: post.publishedAt || null,
        approvedAt: null,
        approvedById: null,
        engagement: post.engagement || null,
        createdAt: new Date(),
      };
      this.posts.set(index + 1, postData);
    });
    this.currentPostId = 5;

    // Create automations
    const automationsData = [
      {
        name: "Welcome Series",
        description: "Automatically sends welcome posts to new followers",
        type: "welcome_series",
        config: { interval: "daily", templates: ["welcome_template_1"] },
        isActive: true,
        triggerCount: 127,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        name: "Daily Quotes",
        description: "Posts inspirational quotes every morning at 8 AM",
        type: "daily_quotes",
        config: { time: "08:00", quotes: ["quote1", "quote2"] },
        isActive: true,
        triggerCount: 45,
        nextRun: new Date(Date.now() + 10 * 60 * 60 * 1000), // tomorrow 8 AM
      },
      {
        name: "Engagement Boost",
        description: "Reposts popular content during peak hours",
        type: "engagement_boost",
        config: { peakHours: ["12:00", "18:00"], threshold: 100 },
        isActive: false,
        triggerCount: 23,
        lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];

    automationsData.forEach((automation, index) => {
      const automationData: Automation = {
        id: index + 1,
        userId: 1,
        name: automation.name,
        description: automation.description,
        type: automation.type,
        config: automation.config,
        isActive: automation.isActive,
        triggerCount: automation.triggerCount,
        lastRun: automation.lastRun || null,
        nextRun: automation.nextRun || null,
        createdAt: new Date(),
      };
      this.automations.set(index + 1, automationData);
    });
    this.currentAutomationId = 4;

    // Create analytics data
    const analyticsData = [
      { platform: "facebook", followers: 12450, engagement: 324, reach: 8920, posts: 15 },
      { platform: "twitter", followers: 8320, engagement: 189, reach: 5440, posts: 20 },
      { platform: "instagram", followers: 3801, engagement: 156, reach: 3200, posts: 12 },
    ];

    analyticsData.forEach((analytics, index) => {
      const analyticsItem: Analytics = {
        id: index + 1,
        userId: 1,
        date: new Date(),
        platform: analytics.platform,
        followers: analytics.followers,
        engagement: analytics.engagement,
        reach: analytics.reach,
        posts: analytics.posts,
        metrics: null,
      };
      this.analytics.set(index + 1, analyticsItem);
    });
    this.currentAnalyticsId = 4;

    // Create recent activities
    const activitiesData = [
      {
        type: "post_published",
        description: "Post published on Facebook",
        platform: "facebook",
        metadata: { postId: 1 },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        type: "story_shared",
        description: "Story shared on Instagram",
        platform: "instagram",
        metadata: { storyId: "story_123" },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        type: "post_scheduled",
        description: "Tweet scheduled successfully",
        platform: "twitter",
        metadata: { postId: 3 },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ];

    activitiesData.forEach((activity, index) => {
      const activityData: Activity = {
        id: index + 1,
        userId: 1,
        type: activity.type,
        description: activity.description,
        platform: activity.platform,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      };
      this.activities.set(index + 1, activityData);
    });
    this.currentActivityId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Legacy method - usernames no longer used
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.supabaseId === supabaseId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      email: insertUser.email,
      name: insertUser.name,
      avatar: insertUser.avatar || null,
      supabaseId: insertUser.supabaseId || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getSocialAccounts(userId: number): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values()).filter(account => account.userId === userId);
  }

  async createSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const id = this.currentSocialAccountId++;
    const account: SocialAccount = {
      ...insertAccount,
      id,
      accessToken: insertAccount.accessToken || null,
      isConnected: insertAccount.isConnected ?? true,
      createdAt: new Date(),
    };
    this.socialAccounts.set(id, account);
    return account;
  }

  async updateSocialAccountStatus(id: number, isConnected: boolean): Promise<void> {
    const account = this.socialAccounts.get(id);
    if (account) {
      account.isConnected = isConnected;
    }
  }

  async deleteSocialAccount(id: number): Promise<void> {
    this.socialAccounts.delete(id);
  }

  async getPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.userId === userId);
  }

  async getPostsByStatus(userId: number, status: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      post => post.userId === userId && post.status === status
    );
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      ...insertPost,
      id,
      media: insertPost.media || null,
      status: insertPost.status || "draft",
      scheduledAt: insertPost.scheduledAt || null,
      engagement: insertPost.engagement || null,
      createdAt: new Date(),
      publishedAt: null,
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (post) {
      Object.assign(post, updates);
      return post;
    }
    return undefined;
  }

  async getUpcomingPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId && post.status === "scheduled")
      .sort((a, b) => (a.scheduledAt?.getTime() || 0) - (b.scheduledAt?.getTime() || 0));
  }

  async getTopPerformingPosts(userId: number, limit = 10): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId && post.status === "published" && post.engagement)
      .sort((a, b) => {
        const aEngagement = (a.engagement as any)?.reach || 0;
        const bEngagement = (b.engagement as any)?.reach || 0;
        return bEngagement - aEngagement;
      })
      .slice(0, limit);
  }

  async getAutomations(userId: number): Promise<Automation[]> {
    return Array.from(this.automations.values()).filter(automation => automation.userId === userId);
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const id = this.currentAutomationId++;
    const automation: Automation = {
      ...insertAutomation,
      id,
      description: insertAutomation.description || null,
      isActive: insertAutomation.isActive ?? true,
      nextRun: insertAutomation.nextRun || null,
      triggerCount: 0,
      lastRun: null,
      createdAt: new Date(),
    };
    this.automations.set(id, automation);
    return automation;
  }

  async updateAutomation(id: number, updates: Partial<Automation>): Promise<Automation | undefined> {
    const automation = this.automations.get(id);
    if (automation) {
      Object.assign(automation, updates);
      return automation;
    }
    return undefined;
  }

  async toggleAutomation(id: number): Promise<void> {
    const automation = this.automations.get(id);
    if (automation) {
      automation.isActive = !automation.isActive;
    }
  }

  async getAnalytics(userId: number, platform?: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      analytics => analytics.userId === userId && (!platform || analytics.platform === platform)
    );
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      followers: insertAnalytics.followers || 0,
      engagement: insertAnalytics.engagement || 0,
      reach: insertAnalytics.reach || 0,
      posts: insertAnalytics.posts || 0,
      metrics: insertAnalytics.metrics || null,
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getAnalyticsSummary(userId: number): Promise<{
    totalFollowers: number;
    engagementRate: number;
    postsThisMonth: number;
    reachThisMonth: number;
  }> {
    const userAnalytics = await this.getAnalytics(userId);
    const totalFollowers = userAnalytics.reduce((sum, analytics) => sum + analytics.followers, 0);
    const totalEngagement = userAnalytics.reduce((sum, analytics) => sum + analytics.engagement, 0);
    const totalReach = userAnalytics.reduce((sum, analytics) => sum + analytics.reach, 0);
    const postsThisMonth = userAnalytics.reduce((sum, analytics) => sum + analytics.posts, 0);
    
    const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

    return {
      totalFollowers,
      engagementRate: Math.round(engagementRate * 10) / 10,
      postsThisMonth,
      reachThisMonth: totalReach,
    };
  }

  async getContentLibrary(userId: number): Promise<ContentLibrary[]> {
    return Array.from(this.contentLibrary.values()).filter(item => item.userId === userId);
  }

  async createContentLibraryItem(insertItem: InsertContentLibrary): Promise<ContentLibrary> {
    const id = this.currentContentLibraryId++;
    const item: ContentLibrary = {
      ...insertItem,
      id,
      content: insertItem.content || null,
      mediaUrl: insertItem.mediaUrl || null,
      mediaType: insertItem.mediaType || null,
      tags: insertItem.tags || null,
      category: insertItem.category || null,
      isTemplate: insertItem.isTemplate ?? false,
      createdAt: new Date(),
    };
    this.contentLibrary.set(id, item);
    return item;
  }

  async getRecentActivities(userId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      id,
      userId: insertActivity.userId,
      type: insertActivity.type,
      description: insertActivity.description,
      platform: insertActivity.platform || null,
      metadata: insertActivity.metadata || null,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
