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
    try {
      // Test Supabase connection
      const { testDatabaseConnection } = await import("./test-db-connection");
      this.isSupabaseConnected = await testDatabaseConnection();

      if (this.isSupabaseConnected) {
        console.log('✓ Supabase database connected - migrating to database storage');
        this.currentStorage = new DatabaseStorage();
        
        // Run migration if needed
        await this.runMigration();
        
        return this.currentStorage;
      } else {
        console.log('⚠ Database connection failed - using memory storage');
        console.log('💡 Please verify your Supabase database URL is correct and the project is active');
        return storage;
      }
    } catch (error: any) {
      console.log('⚠ Database initialization failed, using memory storage:', error.message);
      return storage;
    }
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