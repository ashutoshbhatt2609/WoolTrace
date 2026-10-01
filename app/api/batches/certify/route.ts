import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { hashBatchEvent, hashCertificateSnapshot } from "@/app/lib/event-integrity";
import { ensureUser } from "@/app/lib/ensure-user";
import { batchCertificates, batchEvents, farms, users, woolBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

const certificateInput = z.object({
  batchId: z.string().trim().min(4).max(60),
  productName: z.string().trim().min(2).max(120),
  productRef: z.string().trim().min(2).max(120),
});

const requiredStages = [
  ["registered", "Farm and shearing source"],
  ["farm_source_verified", "Administrator-verified farm source"],
  ["quality_verified", "Laboratory quality"],
  ["offer_accepted", "Farmer sale acceptance"],
  ["transporter:", "Transport custody"],
  ["warehouse:", "Warehouse custody"],
  ["processor:", "Processing or yarn lot"],
  ["brand:register_finished_product", "Finished product identity"],
] as const;

export async function POST(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Sign in to issue a traceability certificate." }, { status: 401 });
  const parsed = certificateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid batch, finished-product name and product reference." }, { status: 400 });

  const db = await ensureUser(user);
  const [member] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.sub)).limit(1);
  const demoAccess = process.env.DEMO_MODE === "true" && user.sub === "demo-farmer";
  if (!demoAccess && member?.role !== "brand" && member?.role !== "admin") return NextResponse.json({ error: "Only an approved brand or administrator can issue the final WoolTrace certificate." }, { status: 403 });

  const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, parsed.data.batchId)).limit(1);
  if (!batch) return NextResponse.json({ error: "That live batch was not found." }, { status: 404 });
  if (!batch.farmId) return NextResponse.json({ error: "The batch has no linked farm source and cannot be certified." }, { status: 409 });
  const [farm] = await db.select().from(farms).where(eq(farms.id, batch.farmId)).limit(1);
  if (!farm) return NextResponse.json({ error: "The linked farm source is unavailable." }, { status: 409 });

  const events = await db.select().from(batchEvents).where(eq(batchEvents.batchId, batch.id)).orderBy(asc(batchEvents.occurredAt));
  const missing = requiredStages.filter(([prefix]) => !events.some((event) => prefix.endsWith(":") ? event.eventType.startsWith(prefix) : event.eventType === prefix)).map(([, label]) => label);
  if (!farm.verified) missing.push("Verified farm identity and location");
  let previousHash: string | null = null;
  let integrityValid = true;
  for (const event of events) {
    if (!event.eventHash || !event.verified || !event.actorRole || event.previousHash !== previousHash) { integrityValid = false; break; }
    const calculated = await hashBatchEvent({ batchId: event.batchId, eventType: event.eventType, title: event.title, location: event.location, actorId: event.actorId, actorRole: event.actorRole, notes: event.notes, occurredAt: event.occurredAt, previousHash: event.previousHash });
    if (calculated !== event.eventHash) { integrityValid = false; break; }
    previousHash = event.eventHash;
  }
  if (!integrityValid) missing.push("Valid hash-linked signed events");
  if (missing.length) return NextResponse.json({ error: `Complete these stages before certification: ${[...new Set(missing)].join(", ")}.` }, { status: 409 });

  const [existing] = await db.select().from(batchCertificates).where(eq(batchCertificates.batchId, batch.id)).limit(1);
  if (existing) return NextResponse.json({ certificate: existing, passportUrl: `/batch/${encodeURIComponent(batch.id)}` });

  const issuedAt = new Date();
  const serial = `WTC-${issuedAt.getFullYear()}-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
  const snapshotHash = await hashCertificateSnapshot([batch.id, farm.id, batch.breed, String(batch.weightKg), parsed.data.productName, parsed.data.productRef, ...events.map((event) => event.eventHash ?? "")]);
  const certificate = { id: crypto.randomUUID(), batchId: batch.id, serial, productName: parsed.data.productName, productRef: parsed.data.productRef, issuedBy: user.sub, issuedAt, snapshotHash, status: "active" };
  await db.insert(batchCertificates).values(certificate);
  await db.update(woolBatches).set({ status: "certified" }).where(eq(woolBatches.id, batch.id));

  return NextResponse.json({ certificate, passportUrl: `/batch/${encodeURIComponent(batch.id)}` }, { status: 201 });
}
