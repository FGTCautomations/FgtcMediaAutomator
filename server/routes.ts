import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPostSchema, 
  insertAutomationSchema, 
  insertSocialAccountSchema, 
  insertUserSchema,
  insertContentCategorySchema,
  insertPostCommentSchema,
  insertMediaLibrarySchema
} from "@shared/schema";
import { openaiService } from "./openai-service";
import { authService } from "./auth-service";
import { DatabaseStorage } from "./db-storage";
import { registerOAuthRoutes } from "./oauth-handlers";
import { initializeAuth, requireAuth } from "./auth";
import { registerAuthRoutes } from "./auth-routes";
import multer from "multer";
import path from "path";

// Use Supabase database storage
const storageInstance = new DatabaseStorage();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = 1; // For MVP, we'll use a single user

  // Serve static files from uploads directory
  app.use('/uploads', express.static('uploads'));

  // Demo login endpoint - bypasses authentication temporarily
  app.post("/api/auth/demo-login", async (req: any, res) => {
    try {
      // Create session manually for user ID 3
      req.session.userId = 3;
      req.session.user = {
        id: 3,
        email: "ddevlaam@hotmail.com",
        name: "Demo User"
      };
      
      res.json({ 
        message: "Demo login successful - session created",
        user: { id: 3, email: "ddevlaam@hotmail.com", name: "Demo User" }
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ error: "Demo login failed" });
    }
  });

  // Authentication middleware - use actual auth
  const authenticateToken = requireAuth;

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
          const user = await storageInstance.getUserByEmail(email);
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
  app.post("/api/ai/improve-post", async (req, res) => {
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

  app.post("/api/ai/generate-hashtags", async (req, res) => {
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

  app.post("/api/ai/suggest-timing", async (req, res) => {
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

  // Note: Authentication is now handled by Supabase Auth on the frontend
  // Removed server-side authentication middleware for Supabase migration

  // Analytics endpoints
  app.get("/api/analytics/summary", async (req: any, res) => {
    try {
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const summary = await storageInstance.getAnalyticsSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
  });

  app.get("/api/analytics", async (req: any, res) => {
    try {
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const { platform } = req.query;
      const analytics = await storageInstance.getAnalytics(userId, platform as string);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Social accounts endpoints - supports unlimited accounts per user
  app.get("/api/social-accounts", async (req: any, res) => {
    try {
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const accounts = await storageInstance.getSocialAccounts(userId);
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
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const { status } = req.query;
      let posts;
      
      if (status) {
        posts = await storageInstance.getPostsByStatus(userId, status as string);
      } else {
        posts = await storageInstance.getPosts(userId);
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/upcoming", async (req: any, res) => {
    try {
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const posts = await storageInstance.getUpcomingPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming posts" });
    }
  });

  app.get("/api/posts/top-performing", async (req: any, res) => {
    try {
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const { limit } = req.query;
      const posts = await storageInstance.getTopPerformingPosts(
        userId,
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
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const automations = await storageInstance.getAutomations(userId);
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
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const { limit } = req.query;
      const activities = await storageInstance.getRecentActivities(
        userId,
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
      const items = await storageInstance.getContentLibrary(DEFAULT_USER_ID);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content library" });
    }
  });

  // Content Categories endpoints
  app.get("/api/content-categories", async (req: any, res) => {
    try {
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const categories = await storageInstance.getContentCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content categories" });
    }
  });

  app.post("/api/content-categories", async (req: any, res) => {
    try {
      const categoryData = insertContentCategorySchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const category = await storageInstance.createContentCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Failed to create content category" });
    }
  });

  app.patch("/api/content-categories/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const category = await storageInstance.updateContentCategory(parseInt(id), updates);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content category" });
    }
  });

  app.delete("/api/content-categories/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      await storageInstance.deleteContentCategory(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content category" });
    }
  });

  // Media Library endpoints
  app.get("/api/media-library", async (req: any, res) => {
    try {
      const userId = DEFAULT_USER_ID; // Using default user for Supabase Auth migration
      
      const media = await storageInstance.getMediaLibrary(userId);
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media library" });
    }
  });

  app.post("/api/media-library", async (req: any, res) => {
    try {
      const mediaData = insertMediaLibrarySchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const media = await storageInstance.createMediaLibraryItem(mediaData);
      res.status(201).json(media);
    } catch (error) {
      res.status(400).json({ error: "Failed to create media item" });
    }
  });

  app.post("/api/media-library/upload", upload.single('file'), authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const fileUrl = `/uploads/${file.filename}`;
      
      const mediaData = insertMediaLibrarySchema.parse({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
        alt: file.originalname,
        tags: [],
        userId: userId,
      });
      
      const media = await storageInstance.createMediaLibraryItem(mediaData);
      res.status(201).json(media);
    } catch (error) {
      console.error("Media upload error:", error);
      res.status(500).json({ error: "Failed to upload file", details: (error as Error).message });
    }
  });

  app.patch("/api/media-library/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const media = await storageInstance.updateMediaLibraryItem(parseInt(id), updates);
      if (!media) {
        return res.status(404).json({ error: "Media item not found" });
      }
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to update media item" });
    }
  });

  app.delete("/api/media-library/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      await storageInstance.deleteMediaLibraryItem(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete media item" });
    }
  });

  // Post Comments endpoints
  app.get("/api/posts/:postId/comments", async (req: any, res) => {
    try {
      const { postId } = req.params;
      const comments = await storageInstance.getPostComments(parseInt(postId));
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post comments" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req: any, res) => {
    try {
      const { postId } = req.params;
      const commentData = insertPostCommentSchema.parse({
        ...req.body,
        postId: parseInt(postId),
        userId: req.userId,
      });
      const comment = await storageInstance.createPostComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Failed to create comment" });
    }
  });

  // Register OAuth routes for real social media connections
  registerOAuthRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
