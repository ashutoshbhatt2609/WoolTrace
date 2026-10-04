import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

if (!process.env.TURSO_DATABASE_URL) process.loadEnvFile?.(".env.local");
const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error("TURSO_DATABASE_URL is required.");

const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const db = drizzle(client);
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("WoolTrace database migrations are up to date.");
client.close();
