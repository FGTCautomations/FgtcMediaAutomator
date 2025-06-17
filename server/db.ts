import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Database connection disabled - using memory storage
// To enable database: provide working SUPABASE_DATABASE_URL
const connectionString = process.env.SUPABASE_DATABASE_URL;

let db: any = null;

if (connectionString && !connectionString.includes('nfncfktttcggsyiufyhe')) {
  try {
    const client = postgres(connectionString, {
      ssl: connectionString.includes('supabase.co') ? 'require' : false,
      max: 20,
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: () => {},
    });
    db = drizzle(client, { schema });
  } catch (error) {
    console.log('Database connection failed, using memory storage');
    db = null;
  }
}

export { db };