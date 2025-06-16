import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPostSchema, 
  insertAutomationSchema, 
  insertSocialAccountSchema, 
  insertContentCategorySchema,
  insertPostCommentSchema,
  insertMediaLibrarySchema
} from "@shared/schema";
import { openaiService } from "./openai-service";
import { registerOAuthRoutes } from "./oauth-handlers";
import { initializeAuth, requireAuth } from "./auth";
import { registerAuthRoutes } from "./auth-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication
  initializeAuth(app);
  
  // Register authentication routes
  registerAuthRoutes(app);

  // Register OAuth routes
  registerOAuthRoutes(app);

  // All routes below require authentication
  const getUserId = (req: any) => req.user?.id || 1;

  // Social Accounts
  app.get("/api/social-accounts", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const accounts = await storage.getSocialAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social accounts" });
    }
  });

  app.post("/api/social-accounts", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const accountData = insertSocialAccountSchema.parse({
        ...req.body,
        userId
      });
      const account = await storage.createSocialAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to create social account" });
    }
  });

  app.patch("/api/social-accounts/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { isConnected } = req.body;
      await storage.updateSocialAccountStatus(parseInt(id), isConnected);
      res.json({ message: "Account status updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update account status" });
    }
  });

  app.delete("/api/social-accounts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSocialAccount(parseInt(id));
      res.json({ message: "Account deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // Posts
  app.get("/api/posts", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { status } = req.query;
      
      if (status) {
        const posts = await storage.getPostsByStatus(userId, status as string);
        res.json(posts);
      } else {
        const posts = await storage.getPosts(userId);
        res.json(posts);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/upcoming", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const posts = await storage.getUpcomingPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming posts" });
    }
  });

  app.get("/api/posts/top-performing", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const posts = await storage.getTopPerformingPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top performing posts" });
    }
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const postData = insertPostSchema.parse({
        ...req.body,
        userId
      });
      const post = await storage.createPost(postData);
      
      // Create activity
      await storage.createActivity({
        userId,
        type: "post_created",
        description: `Created post: ${post.content.slice(0, 50)}...`,
        metadata: { postId: post.id }
      });
      
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Automations
  app.get("/api/automations", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const automations = await storage.getAutomations(userId);
      res.json(automations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch automations" });
    }
  });

  app.post("/api/automations", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const automationData = insertAutomationSchema.parse({
        ...req.body,
        userId
      });
      const automation = await storage.createAutomation(automationData);
      res.status(201).json(automation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create automation" });
    }
  });

  app.patch("/api/automations/:id/toggle", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.toggleAutomation(parseInt(id));
      res.json({ message: "Automation toggled" });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle automation" });
    }
  });

  // Analytics
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { platform } = req.query;
      const analytics = await storage.getAnalytics(userId, platform as string);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/summary", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const summary = await storage.getAnalyticsSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  // Content Library
  app.get("/api/content-library", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const content = await storage.getContentLibrary(userId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content library" });
    }
  });

  // Activities
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const activities = await storage.getRecentActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Content Categories
  app.get("/api/content-categories", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const categories = await storage.getContentCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content categories" });
    }
  });

  app.post("/api/content-categories", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const categoryData = insertContentCategorySchema.parse({
        ...req.body,
        userId
      });
      const category = await storage.createContentCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content category" });
    }
  });

  // Media Library
  app.get("/api/media-library", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const media = await storage.getMediaLibrary(userId);
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media library" });
    }
  });

  app.post("/api/media-library", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      const mediaData = insertMediaLibrarySchema.parse({
        ...req.body,
        userId
      });
      const media = await storage.createMediaLibraryItem(mediaData);
      res.status(201).json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to create media library item" });
    }
  });

  // OpenAI Integration
  app.post("/api/ai/improve-post", requireAuth, async (req, res) => {
    try {
      const { content, platforms, targetAudience } = req.body;
      const improvement = await openaiService.improvePost(content, platforms, targetAudience);
      res.json(improvement);
    } catch (error) {
      res.status(500).json({ error: "Failed to improve post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}