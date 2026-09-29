import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { ensureUser } from "@/app/lib/ensure-user";
import { batchEvents, woolBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

const qualityInput = z.object({ batchId: z.string().min(4), grade: z.string().trim().min(1).max(12), micron: z.coerce.number().positive().max(100), stapleMm: z.coerce.number().positive().max(500), location: z.string().trim().min(2).max(140) });

export async function POST(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = qualityInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid batch, grade, micron and staple length." }, { status: 400 });
  const db = await ensureUser(user);
  const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, parsed.data.batchId)).limit(1);
  if (!batch) return NextResponse.json({ error: "That live batch was not found." }, { status: 404 });
  await db.update(woolBatches).set({ grade: parsed.data.grade, micron: parsed.data.micron, stapleMm: parsed.data.stapleMm, status: "quality_verified" }).where(eq(woolBatches.id, batch.id));
  await db.insert(batchEvents).values({ id: crypto.randomUUID(), batchId: batch.id, eventType: "quality_verified", title: "Laboratory quality verified", location: parsed.data.location, actorId: user.sub, notes: `Grade ${parsed.data.grade}; ${parsed.data.micron} micron; ${parsed.data.stapleMm} mm staple.`, occurredAt: new Date() });
  return NextResponse.json({ ok: true });
}
