import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPostSchema, insertAutomationSchema, insertSocialAccountSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = 1; // For MVP, we'll use a single user

  // Analytics endpoints
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary(DEFAULT_USER_ID);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const { platform } = req.query;
      const analytics = await storage.getAnalytics(DEFAULT_USER_ID, platform as string);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Social accounts endpoints
  app.get("/api/social-accounts", async (req, res) => {
    try {
      const accounts = await storage.getSocialAccounts(DEFAULT_USER_ID);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social accounts" });
    }
  });

  app.post("/api/social-accounts", async (req, res) => {
    try {
      const accountData = insertSocialAccountSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const account = await storage.createSocialAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid account data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create social account" });
      }
    }
  });

  app.patch("/api/social-accounts/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { isConnected } = req.body;
      
      if (typeof isConnected !== "boolean") {
        return res.status(400).json({ error: "isConnected must be a boolean" });
      }

      await storage.updateSocialAccountStatus(parseInt(id), isConnected);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update account status" });
    }
  });

  // Posts endpoints
  app.get("/api/posts", async (req, res) => {
    try {
      const { status } = req.query;
      let posts;
      
      if (status) {
        posts = await storage.getPostsByStatus(DEFAULT_USER_ID, status as string);
      } else {
        posts = await storage.getPosts(DEFAULT_USER_ID);
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/upcoming", async (req, res) => {
    try {
      const posts = await storage.getUpcomingPosts(DEFAULT_USER_ID);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming posts" });
    }
  });

  app.get("/api/posts/top-performing", async (req, res) => {
    try {
      const { limit } = req.query;
      const posts = await storage.getTopPerformingPosts(
        DEFAULT_USER_ID,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top performing posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const post = await storage.createPost(postData);
      
      // Create activity for post creation
      await storage.createActivity({
        userId: DEFAULT_USER_ID,
        type: postData.status === "published" ? "post_published" : "post_scheduled",
        description: `Post ${postData.status} on ${postData.platforms.join(", ")}`,
        platform: postData.platforms[0],
        metadata: { postId: post.id },
      });
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid post data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create post" });
      }
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const post = await storage.updatePost(parseInt(id), updates);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  // Automations endpoints
  app.get("/api/automations", async (req, res) => {
    try {
      const automations = await storage.getAutomations(DEFAULT_USER_ID);
      res.json(automations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch automations" });
    }
  });

  app.post("/api/automations", async (req, res) => {
    try {
      const automationData = insertAutomationSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const automation = await storage.createAutomation(automationData);
      
      // Create activity for automation creation
      await storage.createActivity({
        userId: DEFAULT_USER_ID,
        type: "automation_created",
        description: `Created automation: ${automation.name}`,
        metadata: { automationId: automation.id },
      });
      
      res.status(201).json(automation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid automation data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create automation" });
      }
    }
  });

  app.patch("/api/automations/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.toggleAutomation(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle automation" });
    }
  });

  // Activities endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const { limit } = req.query;
      const activities = await storage.getRecentActivities(
        DEFAULT_USER_ID,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Content Library endpoints
  app.get("/api/content-library", async (req, res) => {
    try {
      const items = await storage.getContentLibrary(DEFAULT_USER_ID);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content library" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
