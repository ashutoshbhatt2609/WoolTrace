import "server-only";
import type { GoogleUser } from "@/app/lib/google-auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export async function ensureUser(user: GoogleUser, role: "farmer" | "buyer" | "partner" | "admin" = "farmer") {
  const db = getDb();
  await db.insert(users).values({ id: user.sub, email: user.email, name: user.name, picture: user.picture ?? null, role, locale: "en", createdAt: new Date() }).onConflictDoUpdate({ target: users.id, set: { email: user.email, name: user.name, picture: user.picture ?? null } });
  return db;
}
