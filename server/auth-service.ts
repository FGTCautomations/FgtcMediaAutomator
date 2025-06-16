import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import type { User } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Extract Supabase URL and key from DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);
const supabaseUrl = `https://${dbUrl.hostname.split('.')[0]}.supabase.co`;
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYWVkZGJ3YWxsdXBrZW9yc2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzOTI4NTIsImV4cCI6MjA0OTk2ODg1Mn0.nGWGWLEQ0b86Sj5CZ2a8kWqJH9RQfINL6LbwczWKK_w"; // This would be your anon key

const supabase = createClient(supabaseUrl, supabaseKey);

export interface AuthResult {
  user: User | null;
  token: string | null;
  error: string | null;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        return { user: null, token: null, error: error.message };
      }

      if (data.user) {
        // Create user in our database
        const user: User = {
          id: 0, // Will be set by database
          email: data.user.email!,
          name,
          avatar: null,
          supabaseId: data.user.id,
          createdAt: new Date(),
        };

        const token = this.generateToken(data.user.id);
        return { user, token, error: null };
      }

      return { user: null, token: null, error: "Failed to create user" };
    } catch (error) {
      return { user: null, token: null, error: "Authentication failed" };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, token: null, error: error.message };
      }

      if (data.user) {
        const token = this.generateToken(data.user.id);
        return { user: null, token, error: null }; // User will be fetched from DB
      }

      return { user: null, token: null, error: "Invalid credentials" };
    } catch (error) {
      return { user: null, token: null, error: "Authentication failed" };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: "7d" });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      return decoded;
    } catch {
      return null;
    }
  }

  async getCurrentUser(token: string): Promise<User | null> {
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    const { data } = await supabase.auth.getUser(token);
    return data.user ? null : null; // Would fetch from our DB using supabaseId
  }
}

export const authService = new AuthService();