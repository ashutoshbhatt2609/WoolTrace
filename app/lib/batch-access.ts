import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { batchEvents, batchParticipants, woolBatches } from "@/db/schema";
import { ApiError } from "./api";
import { hashBatchEvent, hashEvidence } from "./event-integrity";
import type { GoogleUser } from "./google-auth";

export type Transaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
export async function getBatch(tx: Transaction, id: string) {
  const [batch] = await tx.select().from(woolBatches).where(eq(woolBatches.id, id)).limit(1);
  if (!batch) throw new ApiError(404, "This wool batch was not found.");
  return batch;
}
export function requireOwner(batch: typeof woolBatches.$inferSelect, id: string) {
  if (batch.currentOwnerId !== id) throw new ApiError(403, "Only the current owner can do this.");
}
export async function requireParticipant(tx: Transaction, batch: typeof woolBatches.$inferSelect, user: GoogleUser, role: string) {
  if (role === "farmer") {
    if (batch.farmerId !== user.sub) throw new ApiError(403, "Only the source farmer can record shearing.");
    return;
  }
  if (role === "buyer" && batch.currentOwnerId === user.sub) return;
  const [access] = await tx.select().from(batchParticipants).where(and(eq(batchParticipants.batchId, batch.id), eq(batchParticipants.email, user.email.toLowerCase()), eq(batchParticipants.role, role))).limit(1);
  if (!access) throw new ApiError(403, "The batch owner must invite your email for this stage first.");
}
export async function appendEvent(tx: Transaction, input: {
  batchId: string; eventType: string; title: string; actorId: string; actorRole: string;
  location?: string | null; notes?: string | null; evidenceImageData?: string | null; performedAt?: Date | null;
}) {
  const [last] = await tx.select().from(batchEvents).where(eq(batchEvents.batchId, input.batchId)).orderBy(desc(batchEvents.occurredAt)).limit(1);
  // A write transaction serializes updates; strictly increasing timestamps preserve chain order.
  const occurredAt = new Date(Math.max(Date.now(), (last?.occurredAt.getTime() ?? 0) + 1));
  const evidenceImageHash = input.evidenceImageData ? await hashEvidence(input.evidenceImageData) : null;
  const entry = { ...input, location: input.location ?? null, notes: input.notes ?? null, occurredAt, previousHash: last?.eventHash ?? null, evidenceImageHash };
  const eventHash = await hashBatchEvent(entry);
  await tx.insert(batchEvents).values({ ...entry, id: crypto.randomUUID(), eventHash, verified: true });
}
