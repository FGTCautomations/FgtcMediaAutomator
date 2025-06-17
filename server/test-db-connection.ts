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

// Run test if this file is executed directly
testDatabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error("Test failed:", error);
  process.exit(1);
});

export { testDatabaseConnection };