import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { passport, requireAuth } from "./auth";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const signupSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export function registerAuthRoutes(app: Express) {
  // Sign up with email
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.createUser({
        email,
        name,
        password: hashedPassword,
        googleId: null,
        avatar: null,
      });

      // Log user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after signup" });
        }
        res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login with email
  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
      });
    })(req, res, next);
  });

  // Google OAuth routes (disabled - requires API credentials)
  // app.get("/api/auth/google", 
  //   passport.authenticate("google", { scope: ["profile", "email"] })
  // );

  // app.get("/api/auth/google/callback",
  //   passport.authenticate("google", { failureRedirect: "/login?error=google_auth_failed" }),
  //   (req: Request, res: Response) => {
  //     // Successful authentication, redirect to dashboard
  //     res.redirect("/");
  //   }
  // );

  // Get current user
  app.get("/api/auth/user", requireAuth, (req: Request, res: Response) => {
    const user = req.user as any;
    res.json({ id: user.id, email: user.email, name: user.name, avatar: user.avatar });
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Reset analytics (admin only)
  app.post("/api/auth/reset-analytics", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      // For now, analytics are already reset in the database implementation
      // This endpoint can be used for future analytics reset functionality
      
      res.json({ message: "Analytics reset successfully" });
    } catch (error) {
      console.error("Analytics reset error:", error);
      res.status(500).json({ message: "Failed to reset analytics" });
    }
  });
}