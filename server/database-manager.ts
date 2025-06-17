import { DatabaseStorage } from "./db-complete";
import { storage } from "./storage";
import type { IStorage } from "./storage";

class DatabaseManager {
  private static instance: DatabaseManager;
  private currentStorage: IStorage = storage;
  private isSupabaseConnected = false;

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(): Promise<IStorage> {
    // Use memory storage until Supabase project is active
    console.log('⚠ Using memory storage - Supabase project appears inactive');
    console.log('💡 Check your Supabase dashboard for project status and reactivate if needed');
    this.currentStorage = storage;
    this.isSupabaseConnected = false;
    return storage;
  }

  private async runMigration(): Promise<void> {
    try {
      // Check if database is already seeded
      const testUser = await this.currentStorage.getUserByEmail?.("admin@socialmedia.app");
      
      if (!testUser) {
        console.log('🌱 Seeding database with initial data...');
        const { seedDatabase } = await import("./seed-database");
        await seedDatabase();
        console.log('✅ Database migration completed');
      } else {
        console.log('✓ Database already contains data');
      }
    } catch (error: any) {
      console.warn('⚠ Migration failed:', error.message);
    }
  }

  getStorage(): IStorage {
    return this.currentStorage;
  }

  isUsingSupabase(): boolean {
    return this.isSupabaseConnected;
  }

  async switchToSupabase(): Promise<boolean> {
    try {
      const newStorage = await this.initialize();
      this.currentStorage = newStorage;
      return this.isSupabaseConnected;
    } catch (error) {
      return false;
    }
  }
}

export const databaseManager = DatabaseManager.getInstance();