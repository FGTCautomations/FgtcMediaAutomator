import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Please add your Supabase connection string.");
}

// Configure for Supabase compatibility
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  ssl: 'require',
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });