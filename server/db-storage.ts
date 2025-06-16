import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";
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
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      supabaseId: insertUser.supabaseId || null,
    }).returning();
    return result[0];
  }

  async getSocialAccounts(userId: number): Promise<SocialAccount[]> {
    return await db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));
  }

  async createSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const result = await db.insert(socialAccounts).values({
      ...insertAccount,
      accessToken: insertAccount.accessToken || null,
      isConnected: insertAccount.isConnected ?? true,
    }).returning();
    return result[0];
  }

  async updateSocialAccountStatus(id: number, isConnected: boolean): Promise<void> {
    await db.update(socialAccounts)
      .set({ isConnected })
      .where(eq(socialAccounts.id, id));
  }

  async deleteSocialAccount(id: number): Promise<void> {
    await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
  }

  async getPosts(userId: number): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getPostsByStatus(userId: number, status: string): Promise<Post[]> {
    return await db.select().from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.status, status)))
      .orderBy(desc(posts.createdAt));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values({
      ...insertPost,
      media: insertPost.media || null,
      status: insertPost.status || "draft",
      scheduledAt: insertPost.scheduledAt || null,
      engagement: insertPost.engagement || null,
    }).returning();
    return result[0];
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const result = await db.update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  async getUpcomingPosts(userId: number): Promise<Post[]> {
    const now = new Date();
    return await db.select().from(posts)
      .where(and(
        eq(posts.userId, userId),
        eq(posts.status, "scheduled"),
        gte(posts.scheduledAt, now)
      ))
      .orderBy(posts.scheduledAt);
  }

  async getTopPerformingPosts(userId: number, limit = 10): Promise<Post[]> {
    return await db.select().from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.status, "published")))
      .limit(limit)
      .orderBy(desc(posts.createdAt));
  }

  async getAutomations(userId: number): Promise<Automation[]> {
    return await db.select().from(automations)
      .where(eq(automations.userId, userId))
      .orderBy(desc(automations.createdAt));
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const result = await db.insert(automations).values({
      ...insertAutomation,
      description: insertAutomation.description || null,
      isActive: insertAutomation.isActive ?? true,
      nextRun: insertAutomation.nextRun || null,
    }).returning();
    return result[0];
  }

  async updateAutomation(id: number, updates: Partial<Automation>): Promise<Automation | undefined> {
    const result = await db.update(automations)
      .set(updates)
      .where(eq(automations.id, id))
      .returning();
    return result[0];
  }

  async toggleAutomation(id: number): Promise<void> {
    const automation = await db.select().from(automations).where(eq(automations.id, id)).limit(1);
    if (automation[0]) {
      await db.update(automations)
        .set({ isActive: !automation[0].isActive })
        .where(eq(automations.id, id));
    }
  }

  async getAnalytics(userId: number, platform?: string): Promise<Analytics[]> {
    const conditions = [eq(analytics.userId, userId)];
    if (platform) {
      conditions.push(eq(analytics.platform, platform));
    }
    
    return await db.select().from(analytics)
      .where(and(...conditions))
      .orderBy(desc(analytics.date));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values({
      ...insertAnalytics,
      followers: insertAnalytics.followers || 0,
      engagement: insertAnalytics.engagement || 0,
      reach: insertAnalytics.reach || 0,
      posts: insertAnalytics.posts || 0,
      metrics: insertAnalytics.metrics || null,
    }).returning();
    return result[0];
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
    return await db.select().from(contentLibrary)
      .where(eq(contentLibrary.userId, userId))
      .orderBy(desc(contentLibrary.createdAt));
  }

  async createContentLibraryItem(insertItem: InsertContentLibrary): Promise<ContentLibrary> {
    const result = await db.insert(contentLibrary).values({
      ...insertItem,
      content: insertItem.content || null,
      mediaUrl: insertItem.mediaUrl || null,
      mediaType: insertItem.mediaType || null,
      tags: insertItem.tags || null,
      category: insertItem.category || null,
      isTemplate: insertItem.isTemplate ?? false,
    }).returning();
    return result[0];
  }

  async getRecentActivities(userId: number, limit = 10): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values({
      ...insertActivity,
      platform: insertActivity.platform || null,
      metadata: insertActivity.metadata || null,
    }).returning();
    return result[0];
  }

  // Legacy method for compatibility
  async getUserByUsername(username: string): Promise<User | undefined> {
    // This method is deprecated as we no longer use usernames
    return undefined;
  }
}