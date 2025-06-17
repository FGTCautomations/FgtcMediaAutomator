import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use Supabase database URL for production, fallback to local for development
const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("SUPABASE_DATABASE_URL environment variable is required for database connection.");
}
const client = postgres(connectionString, {
  ssl: connectionString.includes('supabase.co') ? 'require' : false,
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {}, // Suppress notices
});

export const db = drizzle(client, { schema });