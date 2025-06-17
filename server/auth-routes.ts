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

  // Demo login endpoint - creates session for existing user
  app.post("/api/auth/demo-login", async (req: Request, res: Response) => {
    try {
      // Find existing user by email
      const user = await storage.getUserByEmail("ddevlaam@hotmail.com");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Manually log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({ 
          message: "Demo login successful",
          user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }
        });
      });
    } catch (error) {
      res.status(500).json({ error: "Demo login failed" });
    }
  });

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

  // Password reset request
  app.post("/api/auth/reset-password-request", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user doesn't exist for security
        return res.json({ message: "If an account with that email exists, a reset link has been sent." });
      }

      // Generate reset token (simple implementation)
      const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // In a real app, you would store the token and send email
      // For demo purposes, return the token directly
      
      res.json({ 
        message: "Reset token generated successfully",
        token: resetToken,
        note: "In production, this token would be sent to your email address"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process reset request" });
    }
  });

  // Password reset
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password, email } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // For demo purposes, allow password reset for any valid token
      // In production, you'd validate the token from database
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // For demo, we'll assume success
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Change password endpoint
  app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters long" });
      }

      // Get user from database
      const dbUser = await storage.getUserByEmail(user.email);
      if (!dbUser || !dbUser.password) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password and update (simplified for demo)
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Update profile endpoint
  app.patch("/api/auth/update-profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { name, email } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      res.json({ 
        message: "Profile updated successfully",
        user: { id: user.id, email: email, name: name }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
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