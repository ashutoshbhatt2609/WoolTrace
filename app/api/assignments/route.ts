import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { api, ApiError, body, json } from "@/app/lib/api";
import { pageInfo, pageInput } from "@/app/lib/pagination";
import { isPortalRole } from "@/app/lib/portals";
import { getDb } from "@/db";
import { batchParticipants, users, woolBatches } from "@/db/schema";

export const GET = api(async (request, user) => {
  const db = getDb(), scope = eq(batchParticipants.email, user.email.trim().toLowerCase());
  const { page, limit, offset } = pageInput(request);
  const [total] = await db.select({ value: count() }).from(batchParticipants)
    .innerJoin(woolBatches, eq(woolBatches.id, batchParticipants.batchId)).where(scope);
  const assignments = await db.select({ id: batchParticipants.id, batchId: woolBatches.id,
    role: batchParticipants.role, breed: woolBatches.breed, weightKg: woolBatches.weightKg,
    status: woolBatches.status, assignedAt: batchParticipants.createdAt }).from(batchParticipants)
    .innerJoin(woolBatches, eq(woolBatches.id, batchParticipants.batchId)).where(scope)
    .orderBy(desc(batchParticipants.createdAt), desc(batchParticipants.id)).limit(limit).offset(offset);
  return json({ assignments, pagination: pageInfo(page, limit, total.value) });
});

export const POST = api(async (request, user) => {
  const { assignmentId } = await body(request, z.object({ assignmentId: z.string().uuid() }));
  return getDb().transaction(async tx => {
    const [assignment] = await tx.select().from(batchParticipants).where(and(
      eq(batchParticipants.id, assignmentId), eq(batchParticipants.email, user.email.trim().toLowerCase())
    )).limit(1);
    if (!assignment || !isPortalRole(assignment.role)) throw new ApiError(403, "This assignment is no longer available to your email.");
    await tx.update(users).set({ role: assignment.role, onboarded: true }).where(eq(users.id, user.sub));
    return json({ redirect: "/portal/" + assignment.role + "?batchId=" + encodeURIComponent(assignment.batchId) });
  });
});
