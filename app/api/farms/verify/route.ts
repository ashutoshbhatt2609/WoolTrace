import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { hashBatchEvent } from "@/app/lib/event-integrity";
import { ensureUser } from "@/app/lib/ensure-user";
import { batchEvents, farms, users, woolBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

const verificationInput = z.object({
  batchId: z.string().trim().min(4).max(60),
  notes: z.string().trim().min(4).max(500),
});

export async function POST(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Sign in as an administrator to verify a farm source." }, { status: 401 });
  const parsed = verificationInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid batch ID and verification note." }, { status: 400 });

  const db = await ensureUser(user);
  const [member] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.sub)).limit(1);
  const demoAccess = process.env.DEMO_MODE === "true" && user.sub === "demo-farmer";
  if (!demoAccess && member?.role !== "admin") return NextResponse.json({ error: "Only an administrator can verify a farm source." }, { status: 403 });

  const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, parsed.data.batchId)).limit(1);
  if (!batch?.farmId) return NextResponse.json({ error: "That batch has no linked farm source." }, { status: 404 });
  const [farm] = await db.select().from(farms).where(eq(farms.id, batch.farmId)).limit(1);
  if (!farm) return NextResponse.json({ error: "The linked farm record was not found." }, { status: 404 });

  const [alreadyVerified] = await db.select({ id: batchEvents.id }).from(batchEvents).where(and(eq(batchEvents.batchId, batch.id), eq(batchEvents.eventType, "farm_source_verified"))).limit(1);
  if (farm.verified && alreadyVerified) return NextResponse.json({ verified: true, farmId: farm.id });

  const [lastEvent] = await db.select({ eventHash: batchEvents.eventHash }).from(batchEvents).where(eq(batchEvents.batchId, batch.id)).orderBy(desc(batchEvents.occurredAt)).limit(1);
  const occurredAt = new Date();
  const title = "Farm identity and shearing source verified";
  const location = `${farm.name}, ${farm.village}, ${farm.district}, ${farm.state}`;
  const eventHash = await hashBatchEvent({ batchId: batch.id, eventType: "farm_source_verified", title, location, actorId: user.sub, actorRole: "admin", notes: parsed.data.notes, occurredAt, previousHash: lastEvent?.eventHash ?? null });

  await db.update(farms).set({ verified: true }).where(eq(farms.id, farm.id));
  await db.insert(batchEvents).values({ id: crypto.randomUUID(), batchId: batch.id, eventType: "farm_source_verified", title, location, actorId: user.sub, actorRole: "admin", notes: parsed.data.notes, previousHash: lastEvent?.eventHash ?? null, eventHash, verified: true, occurredAt });

  return NextResponse.json({ verified: true, farmId: farm.id, eventHash }, { status: 201 });
}
