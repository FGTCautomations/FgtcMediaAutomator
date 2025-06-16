import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  supabaseId: text("supabase_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(), // facebook, twitter, instagram, linkedin
  accountName: text("account_name").notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token"),
  isConnected: boolean("is_connected").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  media: jsonb("media"), // array of media URLs
  platforms: text("platforms").array().notNull(), // array of platform names
  status: text("status").notNull().default("draft"), // draft, scheduled, published, failed
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  engagement: jsonb("engagement"), // likes, shares, comments, reach
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // welcome_series, daily_quotes, engagement_boost, etc.
  config: jsonb("config").notNull(), // automation configuration
  isActive: boolean("is_active").default(true).notNull(),
  triggerCount: integer("trigger_count").default(0).notNull(),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  platform: text("platform").notNull(),
  followers: integer("followers").default(0).notNull(),
  engagement: integer("engagement").default(0).notNull(),
  reach: integer("reach").default(0).notNull(),
  posts: integer("posts").default(0).notNull(),
  metrics: jsonb("metrics"), // additional platform-specific metrics
});

export const contentLibrary = pgTable("content_library", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"), // image, video, document
  tags: text("tags").array(), // array of tags
  category: text("category"),
  isTemplate: boolean("is_template").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // post_published, automation_triggered, account_connected, etc.
  description: text("description").notNull(),
  platform: text("platform"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export const insertAutomationSchema = createInsertSchema(automations).omit({
  id: true,
  createdAt: true,
  triggerCount: true,
  lastRun: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertContentLibrarySchema = createInsertSchema(contentLibrary).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Automation = typeof automations.$inferSelect;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type ContentLibrary = typeof contentLibrary.$inferSelect;
export type InsertContentLibrary = z.infer<typeof insertContentLibrarySchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
