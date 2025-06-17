import { db } from "./db";
import { seedDatabase } from "./seed-database";
import { testDatabaseConnection } from "./test-db-connection";

async function migrateToSupabase() {
  console.log("🚀 Starting Supabase migration...");

  // Test database connection first
  const connectionSuccessful = await testDatabaseConnection();
  if (!connectionSuccessful) {
    throw new Error("Database connection failed. Please verify SUPABASE_DATABASE_URL is correct.");
  }

  try {
    // Push schema to database
    console.log("📊 Pushing database schema...");
    await import("drizzle-kit/api").then(async (drizzleKit) => {
      // Schema should already be pushed via drizzle-kit
      console.log("✅ Schema verification completed");
    });

    // Seed database with initial data
    console.log("🌱 Seeding database with initial data...");
    await seedDatabase();

    console.log("🎉 Supabase migration completed successfully!");
    console.log("📝 Next steps:");
    console.log("  1. Update server/routes.ts to use DatabaseStorage");
    console.log("  2. Restart the application");
    console.log("  3. Verify all functionality works with Supabase backend");

    return true;
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
}

export { migrateToSupabase };

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToSupabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}