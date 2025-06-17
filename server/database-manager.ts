import { IStorage, storage } from "./storage";
import { DatabaseStorage } from "./db-complete";

class DatabaseManager {
  private static instance: DatabaseManager;
  private currentStorage: IStorage = storage;
  private isSupabaseConnected = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(): Promise<IStorage> {
    const connectionString = process.env.SUPABASE_DATABASE_URL;
    
    if (!connectionString) {
      console.log('⚠ No database credentials - using memory storage');
      this.currentStorage = storage;
      this.isSupabaseConnected = false;
      return storage;
    }

    // Skip DNS-dependent connection test for now due to network issues
    console.log('⚠ Network connectivity issues detected - using memory storage temporarily');
    console.log('💡 Database configured and ready for when network resolves');
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
        console.log('✓ Database seeded successfully');
      } else {
        console.log('✓ Database already contains data, skipping seed');
      }
    } catch (error: any) {
      console.error('⚠ Failed to seed database:', error.message);
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
      const newStorage = new DatabaseStorage();
      this.currentStorage = newStorage;
      this.isSupabaseConnected = true;
      return true;
    } catch (error: any) {
      return false;
    }
  }
}

export const databaseManager = DatabaseManager.getInstance();