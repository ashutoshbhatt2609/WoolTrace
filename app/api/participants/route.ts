import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { api, body, json } from "@/app/lib/api";
import { appendEvent, getBatch, requireOwner } from "@/app/lib/batch-access";
import { getDb } from "@/db";
import { batchParticipants } from "@/db/schema";
export const GET = api(async (request, user) => {
  const batchId = new URL(request.url).searchParams.get("batchId") ?? "";
  return getDb().transaction(async tx => {
    const batch = await getBatch(tx, batchId); requireOwner(batch, user.sub);
    return json({ participants: await tx.select().from(batchParticipants).where(eq(batchParticipants.batchId, batchId)) });
  });
});
export const POST = api(async (request, user) => {
  const input = await body(request, z.object({ batchId: z.string().min(4), email: z.string().trim().email().max(254).transform(s => s.toLowerCase()), role: z.enum(["laboratory", "transporter", "warehouse", "processor", "brand"]) }));
  return getDb().transaction(async tx => {
    const batch = await getBatch(tx, input.batchId); requireOwner(batch, user.sub);
    await tx.insert(batchParticipants).values({ ...input, id: crypto.randomUUID(), invitedBy: user.sub, createdAt: new Date() }).onConflictDoUpdate({ target: [batchParticipants.batchId, batchParticipants.email], set: { role: input.role, invitedBy: user.sub } });
    await appendEvent(tx, { batchId: batch.id, actorId: user.sub, actorRole: "owner", eventType: "participant_invited", title: "Owner assigned a " + input.role, notes: "Access granted to a participant for this batch. Contact details remain private." });
    return json({ ok: true }, 201);
  });
});
export const DELETE = api(async (request, user) => {
  const input = await body(request, z.object({ batchId: z.string(), id: z.string().uuid() }));
  return getDb().transaction(async tx => {
    const batch = await getBatch(tx, input.batchId); requireOwner(batch, user.sub);
    await tx.delete(batchParticipants).where(and(eq(batchParticipants.id, input.id), eq(batchParticipants.batchId, batch.id)));
    await appendEvent(tx, { batchId: batch.id, actorId: user.sub, actorRole: "owner", eventType: "participant_removed", title: "Owner removed participant access" });
    return json({ ok: true });
  });
});
