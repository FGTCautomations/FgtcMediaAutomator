import { db } from "./db";
import { 
  users, 
  socialAccounts, 
  posts, 
  automations, 
  analytics, 
  contentLibrary, 
  activities,
  contentCategories,
  postComments,
  mediaLibrary,
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
  type ContentCategory,
  type InsertContentCategory,
  type PostComment,
  type InsertPostComment,
  type MediaLibrary,
  type InsertMediaLibrary,
} from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Social Accounts
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

  // Posts
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
    const result = await db.insert(posts).values(insertPost).returning();
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
    return await db.select().from(posts)
      .where(and(
        eq(posts.userId, userId),
        eq(posts.status, "scheduled"),
        gte(posts.scheduledAt, new Date())
      ))
      .orderBy(posts.scheduledAt)
      .limit(10);
  }

  async getTopPerformingPosts(userId: number, limit = 10): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.engagement))
      .limit(limit);
  }

  // Automations
  async getAutomations(userId: number): Promise<Automation[]> {
    return await db.select().from(automations).where(eq(automations.userId, userId));
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const result = await db.insert(automations).values(insertAutomation).returning();
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

  // Analytics
  async getAnalytics(userId: number, platform?: string): Promise<Analytics[]> {
    if (platform) {
      return await db.select().from(analytics)
        .where(and(eq(analytics.userId, userId), eq(analytics.platform, platform)))
        .orderBy(desc(analytics.date));
    }
    return await db.select().from(analytics)
      .where(eq(analytics.userId, userId))
      .orderBy(desc(analytics.date));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values(insertAnalytics).returning();
    return result[0];
  }

  async getAnalyticsSummary(userId: number): Promise<{
    totalFollowers: number;
    engagementRate: number;
    postsThisMonth: number;
    reachThisMonth: number;
  }> {
    // Reset analytics to 0 for fresh start
    return {
      totalFollowers: 0,
      engagementRate: 0,
      postsThisMonth: 0,
      reachThisMonth: 0,
    };
  }

  // Content Library
  async getContentLibrary(userId: number): Promise<ContentLibrary[]> {
    return await db.select().from(contentLibrary).where(eq(contentLibrary.userId, userId));
  }

  async createContentLibraryItem(insertItem: InsertContentLibrary): Promise<ContentLibrary> {
    const result = await db.insert(contentLibrary).values(insertItem).returning();
    return result[0];
  }

  // Activities
  async getRecentActivities(userId: number, limit = 10): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(insertActivity).returning();
    return result[0];
  }

  // Content Categories
  async getContentCategories(userId: number): Promise<ContentCategory[]> {
    return await db.select().from(contentCategories).where(eq(contentCategories.userId, userId));
  }

  async createContentCategory(insertCategory: InsertContentCategory): Promise<ContentCategory> {
    const result = await db.insert(contentCategories).values(insertCategory).returning();
    return result[0];
  }

  async updateContentCategory(id: number, updates: Partial<ContentCategory>): Promise<ContentCategory | undefined> {
    const result = await db.update(contentCategories)
      .set(updates)
      .where(eq(contentCategories.id, id))
      .returning();
    return result[0];
  }

  async deleteContentCategory(id: number): Promise<void> {
    await db.delete(contentCategories).where(eq(contentCategories.id, id));
  }

  // Post Comments
  async getPostComments(postId: number): Promise<PostComment[]> {
    return await db.select().from(postComments).where(eq(postComments.postId, postId));
  }

  async createPostComment(insertComment: InsertPostComment): Promise<PostComment> {
    const result = await db.insert(postComments).values(insertComment).returning();
    return result[0];
  }

  // Media Library
  async getMediaLibrary(userId: number): Promise<MediaLibrary[]> {
    return await db.select().from(mediaLibrary).where(eq(mediaLibrary.userId, userId));
  }

  async createMediaLibraryItem(insertMedia: InsertMediaLibrary): Promise<MediaLibrary> {
    const result = await db.insert(mediaLibrary).values(insertMedia).returning();
    return result[0];
  }

  async updateMediaLibraryItem(id: number, updates: Partial<MediaLibrary>): Promise<MediaLibrary | undefined> {
    const result = await db.update(mediaLibrary)
      .set(updates)
      .where(eq(mediaLibrary.id, id))
      .returning();
    return result[0];
  }

  async deleteMediaLibraryItem(id: number): Promise<void> {
    await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
  }
}