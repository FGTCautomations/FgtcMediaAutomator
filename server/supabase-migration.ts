import { databaseManager } from "./database-manager";
import { seedDatabase } from "./seed-database";

export async function migrateToNewSupabase() {
  console.log("🔄 Detecting new Supabase project...");
  
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  
  if (!connectionString) {
    console.log("⚠ SUPABASE_DATABASE_URL not provided");
    return false;
  }

  // Check if it's the new project
  if (connectionString.includes('bospemspdmewrvpkuajp')) {
    console.log("✅ New Supabase project detected");
    
    try {
      // Test connection
      const { testDatabaseConnection } = await import("./test-db-connection");
      const isConnected = await testDatabaseConnection();
      
      if (isConnected) {
        console.log("🚀 Migrating to new Supabase database...");
        
        // Push schema
        console.log("📊 Pushing database schema...");
        // Schema will be pushed via drizzle when db is accessed
        
        // Seed with initial data
        console.log("🌱 Seeding database...");
        await seedDatabase();
        
        console.log("🎉 Migration to new Supabase project completed!");
        return true;
      } else {
        console.log("❌ Connection test failed");
        return false;
      }
    } catch (error: any) {
      console.error("❌ Migration failed:", error.message);
      return false;
    }
  }
  
  return false;
}

// Auto-trigger migration check
let migrationChecked = false;

export async function autoCheckMigration() {
  if (!migrationChecked) {
    migrationChecked = true;
    setTimeout(async () => {
      await migrateToNewSupabase();
    }, 2000); // Check after 2 seconds
  }
}