import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { User } from "@shared/schema";

export interface AuthResult {
  user: User | null;
  token: string | null;
  error: string | null;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // For MVP, create a simple user record
      const user: User = {
        id: 0, // Will be set by storage
        email,
        name,
        avatar: null,
        supabaseId: null, // Not using Supabase for MVP
        createdAt: new Date(),
      };

      const token = this.generateToken(email);
      return { user, token, error: null };
    } catch (error) {
      return { user: null, token: null, error: "Authentication failed" };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // For MVP, simplified authentication
      const token = this.generateToken(email);
      return { user: null, token, error: null }; // User will be fetched from storage
    } catch (error) {
      return { user: null, token: null, error: "Authentication failed" };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    return { error: null };
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
    return null; // Simplified for MVP
  }
}

export const authService = new AuthService();