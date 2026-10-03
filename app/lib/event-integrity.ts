import "server-only";

type IntegrityInput = {
  batchId: string;
  eventType: string;
  title: string;
  location?: string | null;
  actorId: string;
  actorRole: string;
  notes?: string | null;
  occurredAt: Date;
  previousHash?: string | null;
  evidenceImageHash?: string | null;
};

export async function hashBatchEvent(input: IntegrityInput) {
  const canonical = JSON.stringify({
    batchId: input.batchId,
    eventType: input.eventType,
    title: input.title,
    location: input.location ?? null,
    actorId: input.actorId,
    actorRole: input.actorRole,
    notes: input.notes ?? null,
    occurredAt: input.occurredAt.toISOString(),
    previousHash: input.previousHash ?? null,
    evidenceImageHash: input.evidenceImageHash ?? null,
  });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashEvidence(data: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
