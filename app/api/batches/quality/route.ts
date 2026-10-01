import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { ensureUser } from "@/app/lib/ensure-user";
import { hashBatchEvent } from "@/app/lib/event-integrity";
import { batchEvents, users, woolBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

const qualityInput = z.object({ batchId: z.string().min(4), grade: z.string().trim().min(1).max(12), micron: z.coerce.number().positive().max(100), stapleMm: z.coerce.number().positive().max(500), location: z.string().trim().min(2).max(140) });

export async function POST(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = qualityInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid batch, grade, micron and staple length." }, { status: 400 });
  const db = await ensureUser(user);
  const [member] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.sub)).limit(1);
  const demoAccess = process.env.DEMO_MODE === "true" && user.sub === "demo-farmer";
  if (!demoAccess && member?.role !== "laboratory" && member?.role !== "admin") return NextResponse.json({ error: "Only an approved laboratory or administrator can sign quality measurements." }, { status: 403 });
  const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, parsed.data.batchId)).limit(1);
  if (!batch) return NextResponse.json({ error: "That live batch was not found." }, { status: 404 });
  await db.update(woolBatches).set({ grade: parsed.data.grade, micron: parsed.data.micron, stapleMm: parsed.data.stapleMm, status: "quality_verified" }).where(eq(woolBatches.id, batch.id));
  const now = new Date();
  const notes = `Grade ${parsed.data.grade}; ${parsed.data.micron} micron; ${parsed.data.stapleMm} mm staple.`;
  const [lastEvent] = await db.select({ eventHash: batchEvents.eventHash }).from(batchEvents).where(eq(batchEvents.batchId, batch.id)).orderBy(desc(batchEvents.occurredAt)).limit(1);
  const eventHash = await hashBatchEvent({ batchId: batch.id, eventType: "quality_verified", title: "Laboratory quality verified", location: parsed.data.location, actorId: user.sub, actorRole: "laboratory", notes, occurredAt: now, previousHash: lastEvent?.eventHash ?? null });
  await db.insert(batchEvents).values({ id: crypto.randomUUID(), batchId: batch.id, eventType: "quality_verified", title: "Laboratory quality verified", location: parsed.data.location, actorId: user.sub, actorRole: "laboratory", notes, previousHash: lastEvent?.eventHash ?? null, eventHash, verified: true, occurredAt: now });
  return NextResponse.json({ ok: true });
}
