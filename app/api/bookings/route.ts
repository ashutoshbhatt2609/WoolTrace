import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { ensureUser } from "@/app/lib/ensure-user";
import { bookings, woolBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

const bookingInput = z.object({ batchId: z.string().optional(), kind: z.enum(["transport", "warehouse", "shearing", "veterinary", "quality", "processing"]), providerName: z.string().trim().min(2).max(120), scheduledAt: z.coerce.date() });

export async function GET() {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await ensureUser(user);
  const records = await db.select().from(bookings).where(eq(bookings.userId, user.sub)).orderBy(desc(bookings.scheduledAt));
  return NextResponse.json({ bookings: records }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = bookingInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a service, provider and valid date." }, { status: 400 });
  const db = await ensureUser(user);
  if (parsed.data.batchId) {
    const [batch] = await db.select({ id: woolBatches.id }).from(woolBatches).where(eq(woolBatches.id, parsed.data.batchId)).limit(1);
    if (!batch) return NextResponse.json({ error: "The selected live batch was not found." }, { status: 404 });
  }
  const id = crypto.randomUUID();
  await db.insert(bookings).values({ id, batchId: parsed.data.batchId || null, userId: user.sub, kind: parsed.data.kind, providerName: parsed.data.providerName, scheduledAt: parsed.data.scheduledAt, status: "requested" });
  return NextResponse.json({ booking: { id, ...parsed.data, status: "requested" } }, { status: 201 });
}
