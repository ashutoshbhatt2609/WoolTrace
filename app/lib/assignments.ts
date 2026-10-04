import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { batchParticipants, users } from "@/db/schema";
import type { GoogleUser } from "./google-auth";
import { ensureUser } from "./ensure-user";
import { isPortalRole } from "./portals";

// Google supplies a verified email. An invitation grants only that batch's stage,
// never seller rights or access to somebody else's assignments.
export async function startGoogleWorkspace(user: GoogleUser) {
  const db = await ensureUser(user);
  const invitations = await db.select({ role: batchParticipants.role }).from(batchParticipants)
    .where(eq(batchParticipants.email, user.email.trim().toLowerCase()))
    .orderBy(desc(batchParticipants.createdAt), desc(batchParticipants.id));
  const roles = [...new Set(invitations.map(i => i.role).filter(isPortalRole))];
  if (roles.length > 1) return "/assignments";
  if (roles.length === 1) {
    await db.update(users).set({ role: roles[0], onboarded: true }).where(eq(users.id, user.sub));
    return "/portal/" + roles[0];
  }
  const [member] = await getDb().select().from(users).where(eq(users.id, user.sub)).limit(1);
  return member.onboarded ? "/dashboard" : "/onboarding";
}
