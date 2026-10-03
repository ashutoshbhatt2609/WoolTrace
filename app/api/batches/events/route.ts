import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { hashBatchEvent, hashEvidence } from "@/app/lib/event-integrity";
import { getDb } from "@/db";
import { batchEvents, users, woolBatches } from "@/db/schema";
import { isPortalRole } from "@/app/lib/portals";

export const dynamic = "force-dynamic";

const eventInput = z.object({
  batchId: z.string().trim().min(4).max(60),
  portalRole: z.string().refine(isPortalRole),
  title: z.string().trim().min(3).max(120),
  location: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(500).optional(),
  evidenceImageData: z.string().max(500_000).optional(),
  finalWeightKg: z.coerce.number().positive().max(100_000).optional(),
  shearedAt: z.coerce.date().optional(),
});

export async function POST(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Sign in to add a custody event." }, { status: 401 });
  const parsed = eventInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid batch ID and event details." }, { status: 400 });

  const db = getDb();
  const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, parsed.data.batchId)).limit(1);
  if (!batch) return NextResponse.json({ error: "This batch is not in the live database. Register a batch first, then add its stage updates." }, { status: 404 });

  const [member] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.sub)).limit(1);
  const demoAccess = process.env.DEMO_MODE === "true" && user.sub === "demo-farmer";
  if (!demoAccess && member?.role !== parsed.data.portalRole) {
    return NextResponse.json({ error: `Your account is registered as ${member?.role ?? "farmer"} and cannot record a ${parsed.data.portalRole} stage.` }, { status: 403 });
  }

  const now = new Date();
  const eventType = `${parsed.data.portalRole}:${parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
  const isShearingCompletion = eventType === "farmer:complete_shearing_with_photo";
  if (isShearingCompletion && (!parsed.data.evidenceImageData?.startsWith("data:image/") || !parsed.data.finalWeightKg || !parsed.data.shearedAt)) {
    return NextResponse.json({ error: "Add the completion date, final wool weight and a shearing photo." }, { status: 400 });
  }
  const evidenceImageHash = parsed.data.evidenceImageData ? await hashEvidence(parsed.data.evidenceImageData) : null;
  const notes = isShearingCompletion
    ? `Shearing completed by the farmer. Final wool weight: ${parsed.data.finalWeightKg} kg. ${parsed.data.notes ?? ""}`.trim()
    : parsed.data.notes || `Recorded from the ${parsed.data.portalRole} portal.`;
  const [lastEvent] = await db.select({ eventHash: batchEvents.eventHash }).from(batchEvents).where(eq(batchEvents.batchId, parsed.data.batchId)).orderBy(desc(batchEvents.occurredAt)).limit(1);
  const eventHash = await hashBatchEvent({ batchId: parsed.data.batchId, eventType, title: parsed.data.title, location: parsed.data.location || null, actorId: user.sub, actorRole: parsed.data.portalRole, notes, occurredAt: now, previousHash: lastEvent?.eventHash ?? null, evidenceImageHash });
  await db.insert(batchEvents).values({
    id: crypto.randomUUID(),
    batchId: parsed.data.batchId,
    eventType,
    title: parsed.data.title,
    location: parsed.data.location || null,
    actorId: user.sub,
    actorRole: parsed.data.portalRole,
    notes,
    previousHash: lastEvent?.eventHash ?? null,
    eventHash,
    verified: true,
    evidenceImageData: parsed.data.evidenceImageData || null,
    evidenceImageHash,
    occurredAt: now,
  });
  await db.update(woolBatches).set(isShearingCompletion
    ? { status: "shearing_complete", weightKg: parsed.data.finalWeightKg!, shearedAt: parsed.data.shearedAt! }
    : { status: parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "_") }).where(eq(woolBatches.id, parsed.data.batchId));

  return NextResponse.json({ event: { title: parsed.data.title, occurredAt: now.toISOString() } }, { status: 201 });
}
