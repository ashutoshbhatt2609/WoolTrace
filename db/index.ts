import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (database) return database;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is missing. Connect a Turso database in Vercel before using WoolTrace records.");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  database = drizzle(client, { schema });
  return database;
}
