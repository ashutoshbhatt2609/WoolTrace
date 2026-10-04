import "server-only";
import type { GoogleUser } from "@/app/lib/google-auth";
import { getDb } from "@/db";
import { batchParticipants, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { isPortalRole } from "./portals";

export async function ensureUser(user: GoogleUser, role: "farmer" | "buyer" | "laboratory" | "transporter" | "warehouse" | "processor" | "brand" = "farmer") {
  const db = getDb();
  const email = user.email.trim().toLowerCase();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, user.sub)).limit(1);
  // Seed only a new account from its email assignment. Ordinary API calls must
  // not keep overriding a member's deliberately selected workspace.
  const [invite] = !existing ? await db.select({ role: batchParticipants.role }).from(batchParticipants)
    .where(eq(batchParticipants.email, email)).orderBy(desc(batchParticipants.createdAt), desc(batchParticipants.id)).limit(1) : [];
  const assignedRole = invite && isPortalRole(invite.role) ? invite.role : null;
  await db.insert(users).values({ id: user.sub, email, name: user.name, picture: user.picture ?? null, role: assignedRole ?? role, onboarded: !!assignedRole, locale: "en", createdAt: new Date() }).onConflictDoUpdate({ target: users.id, set: { email, name: user.name, picture: user.picture ?? null } });
  return db;
}
