import { db } from "./db";
import {
  users,
  socialAccounts,
  posts,
  automations,
  analytics,
  activities,
  contentLibrary,
  contentCategories,
  mediaLibrary,
  type InsertUser,
  type InsertPost,
  type InsertAutomation,
  type InsertAnalytics,
  type InsertActivity,
} from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding Supabase database...");

    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("✓ Database already seeded");
      return;
    }

    // Create default user
    const [user] = await db.insert(users).values({
      email: "admin@socialmedia.app",
      name: "Admin User",
      role: "admin",
      password: null,
      googleId: null,
      avatar: null,
      currentWorkspaceId: null,
    }).returning();

    console.log("✓ Created admin user:", user.email);

    // Create sample posts
    const postsData = [
      {
        userId: user.id,
        content: "New Product Launch Post - Exciting announcement about our latest innovation!",
        platforms: ["facebook", "instagram"],
        status: "published",
        engagement: { likes: 324, shares: 45, comments: 28, reach: 12450 },
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        content: "Behind the Scenes Video - Take a look at our amazing team in action!",
        platforms: ["youtube", "twitter"],
        status: "published",
        engagement: { likes: 189, shares: 32, comments: 15, reach: 8320 },
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        content: "Product launch announcement with detailed features and benefits",
        platforms: ["facebook", "twitter"],
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        content: "Weekly industry insights post for our LinkedIn audience",
        platforms: ["linkedin"],
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ];

    for (const postData of postsData) {
      await db.insert(posts).values(postData);
    }

    console.log("✓ Created sample posts");

    // Create automations
    const automationsData = [
      {
        userId: user.id,
        name: "Welcome Series",
        description: "Automatically sends welcome posts to new followers",
        type: "welcome_series",
        config: { interval: "daily", templates: ["welcome_template_1"] },
        isActive: true,
        triggerCount: 127,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        name: "Daily Quotes",
        description: "Posts inspirational quotes every morning at 8 AM",
        type: "daily_quotes",
        config: { time: "08:00", quotes: ["quote1", "quote2"] },
        isActive: true,
        triggerCount: 45,
        nextRun: new Date(Date.now() + 10 * 60 * 60 * 1000),
      },
      {
        userId: user.id,
        name: "Engagement Boost",
        description: "Reposts popular content during peak hours",
        type: "engagement_boost",
        config: { peakHours: ["12:00", "18:00"], threshold: 100 },
        isActive: false,
        triggerCount: 23,
        lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const automationData of automationsData) {
      await db.insert(automations).values(automationData);
    }

    console.log("✓ Created automations");

    // Create analytics data
    const analyticsData = [
      { 
        userId: user.id,
        date: new Date(),
        platform: "facebook", 
        followers: 12450, 
        engagement: 324, 
        reach: 8920, 
        posts: 15 
      },
      { 
        userId: user.id,
        date: new Date(),
        platform: "twitter", 
        followers: 8320, 
        engagement: 189, 
        reach: 5440, 
        posts: 20 
      },
      { 
        userId: user.id,
        date: new Date(),
        platform: "instagram", 
        followers: 3801, 
        engagement: 156, 
        reach: 3200, 
        posts: 12 
      },
    ];

    for (const analyticsItem of analyticsData) {
      await db.insert(analytics).values(analyticsItem);
    }

    console.log("✓ Created analytics data");

    // Create recent activities
    const activitiesData = [
      {
        userId: user.id,
        type: "post_published",
        description: "Post published on Facebook",
        platform: "facebook",
        metadata: { postId: 1 },
      },
      {
        userId: user.id,
        type: "story_shared",
        description: "Story shared on Instagram",
        platform: "instagram",
        metadata: { storyId: "story_123" },
      },
      {
        userId: user.id,
        type: "post_scheduled",
        description: "Tweet scheduled successfully",
        platform: "twitter",
        metadata: { postId: 3 },
      },
    ];

    for (const activityData of activitiesData) {
      await db.insert(activities).values(activityData);
    }

    console.log("✓ Created activities");
    console.log("🎉 Database seeding completed successfully!");

    return user;
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}