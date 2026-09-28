import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
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
  if (!demoAccess && member?.role !== parsed.data.portalRole && member?.role !== "admin") {
    return NextResponse.json({ error: `Your account is registered as ${member?.role ?? "farmer"}. An administrator must assign this portal before you can sign its events.` }, { status: 403 });
  }

  const now = new Date();
  await db.insert(batchEvents).values({
    id: crypto.randomUUID(),
    batchId: parsed.data.batchId,
    eventType: `${parsed.data.portalRole}:${parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`,
    title: parsed.data.title,
    location: parsed.data.location || null,
    actorId: user.sub,
    notes: parsed.data.notes || `Recorded from the ${parsed.data.portalRole} portal.`,
    occurredAt: now,
  });
  await db.update(woolBatches).set({ status: parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "_") }).where(eq(woolBatches.id, parsed.data.batchId));

  return NextResponse.json({ event: { title: parsed.data.title, occurredAt: now.toISOString() } }, { status: 201 });
}
