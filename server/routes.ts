import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPostSchema, insertAutomationSchema, insertSocialAccountSchema, insertUserSchema } from "@shared/schema";
import { openaiService } from "./openai-service";
import { authService } from "./auth-service";
import { DatabaseStorage } from "./db-storage";

// Use database storage in production or memory storage for development
const storageInstance = process.env.DATABASE_URL ? new DatabaseStorage() : storage;

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = 1; // For MVP, we'll use a single user

  // Authentication middleware
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.userId = DEFAULT_USER_ID; // Fallback for development
      return next();
    }

    const decoded = authService.verifyToken(token);
    if (decoded) {
      // Get user from database using supabaseId
      const user = await storageInstance.getUserBySupabaseId(decoded.userId);
      req.userId = user?.id || DEFAULT_USER_ID;
    } else {
      req.userId = DEFAULT_USER_ID;
    }
    next();
  };

  // Authentication endpoints
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const authResult = await authService.signUp(email, password, name);
      
      if (authResult.error) {
        return res.status(400).json({ error: authResult.error });
      }

      // Create user in our database
      if (authResult.user) {
        const user = await storageInstance.createUser({
          email,
          name,
          supabaseId: authResult.user.supabaseId,
        });
        
        res.status(201).json({ user, token: authResult.token });
      } else {
        res.status(400).json({ error: "Failed to create user" });
      }
    } catch (error) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      const authResult = await authService.signIn(email, password);
      
      if (authResult.error) {
        return res.status(400).json({ error: authResult.error });
      }

      if (authResult.token) {
        const decoded = authService.verifyToken(authResult.token);
        if (decoded) {
          const user = await storageInstance.getUserBySupabaseId(decoded.userId);
          res.json({ user, token: authResult.token });
        } else {
          res.status(400).json({ error: "Invalid token" });
        }
      } else {
        res.status(400).json({ error: "Authentication failed" });
      }
    } catch (error) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    try {
      const result = await authService.signOut();
      res.json({ success: !result.error });
    } catch (error) {
      res.status(500).json({ error: "Signout failed" });
    }
  });

  // OpenAI endpoints
  app.post("/api/ai/improve-post", authenticateToken, async (req, res) => {
    try {
      const { content, platforms, targetAudience } = req.body;
      
      if (!content || !platforms) {
        return res.status(400).json({ error: "Content and platforms are required" });
      }

      const improvement = await openaiService.improvePost(content, platforms, targetAudience);
      res.json(improvement);
    } catch (error) {
      res.status(500).json({ error: "Failed to improve post content" });
    }
  });

  app.post("/api/ai/generate-hashtags", authenticateToken, async (req, res) => {
    try {
      const { content, platforms } = req.body;
      
      if (!content || !platforms) {
        return res.status(400).json({ error: "Content and platforms are required" });
      }

      const hashtags = await openaiService.generateHashtags(content, platforms);
      res.json({ hashtags });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate hashtags" });
    }
  });

  app.post("/api/ai/suggest-timing", authenticateToken, async (req, res) => {
    try {
      const { content, platforms } = req.body;
      
      if (!content || !platforms) {
        return res.status(400).json({ error: "Content and platforms are required" });
      }

      const timing = await openaiService.suggestBestPostingTime(content, platforms);
      res.json(timing);
    } catch (error) {
      res.status(500).json({ error: "Failed to suggest timing" });
    }
  });

  // Apply authentication middleware to all routes below
  app.use(authenticateToken);

  // Analytics endpoints
  app.get("/api/analytics/summary", async (req: any, res) => {
    try {
      const summary = await storageInstance.getAnalyticsSummary(req.userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  app.get("/api/analytics", async (req: any, res) => {
    try {
      const { platform } = req.query;
      const analytics = await storageInstance.getAnalytics(req.userId, platform as string);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Social accounts endpoints - supports unlimited accounts per user
  app.get("/api/social-accounts", async (req: any, res) => {
    try {
      const accounts = await storageInstance.getSocialAccounts(req.userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social accounts" });
    }
  });

  app.post("/api/social-accounts", async (req: any, res) => {
    try {
      const accountData = insertSocialAccountSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const account = await storageInstance.createSocialAccount(accountData);
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

      await storageInstance.updateSocialAccountStatus(parseInt(id), isConnected);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update account status" });
    }
  });

  app.delete("/api/social-accounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storageInstance.deleteSocialAccount(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete social account" });
    }
  });

  // Posts endpoints
  app.get("/api/posts", async (req: any, res) => {
    try {
      const { status } = req.query;
      let posts;
      
      if (status) {
        posts = await storageInstance.getPostsByStatus(req.userId, status as string);
      } else {
        posts = await storageInstance.getPosts(req.userId);
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/upcoming", async (req: any, res) => {
    try {
      const posts = await storageInstance.getUpcomingPosts(req.userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming posts" });
    }
  });

  app.get("/api/posts/top-performing", async (req: any, res) => {
    try {
      const { limit } = req.query;
      const posts = await storageInstance.getTopPerformingPosts(
        req.userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top performing posts" });
    }
  });

  app.post("/api/posts", async (req: any, res) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const post = await storageInstance.createPost(postData);
      
      // Create activity for post creation
      await storageInstance.createActivity({
        userId: req.userId,
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

  app.patch("/api/posts/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const post = await storageInstance.updatePost(parseInt(id), updates);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  // Automations endpoints
  app.get("/api/automations", async (req: any, res) => {
    try {
      const automations = await storageInstance.getAutomations(req.userId);
      res.json(automations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch automations" });
    }
  });

  app.post("/api/automations", async (req: any, res) => {
    try {
      const automationData = insertAutomationSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const automation = await storageInstance.createAutomation(automationData);
      
      // Create activity for automation creation
      await storageInstance.createActivity({
        userId: req.userId,
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

  app.patch("/api/automations/:id/toggle", async (req: any, res) => {
    try {
      const { id } = req.params;
      await storageInstance.toggleAutomation(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle automation" });
    }
  });

  // Activities endpoints
  app.get("/api/activities", async (req: any, res) => {
    try {
      const { limit } = req.query;
      const activities = await storageInstance.getRecentActivities(
        req.userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Content Library endpoints
  app.get("/api/content-library", async (req: any, res) => {
    try {
      const items = await storageInstance.getContentLibrary(req.userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content library" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
