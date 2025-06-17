import postgres from "postgres";

async function testDatabaseConnection() {
  console.log("Testing Supabase database connection...");
  
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ SUPABASE_DATABASE_URL not found");
    return false;
  }
  
  console.log("Connection string format:", connectionString.replace(/:[^:@]+@/, ':****@'));
  
  try {
    const client = postgres(connectionString, {
      ssl: 'require',
      max: 1,
      connect_timeout: 5,
    });
    
    const result = await client`SELECT 1 as test`;
    console.log("✅ Database connection successful:", result);
    await client.end();
    return true;
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Error details:", error);
    return false;
  }
}

if (require.main === module) {
  testDatabaseConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testDatabaseConnection };