import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { ensureUser } from "@/app/lib/ensure-user";
import { bids, woolBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

const bidInput = z.object({ batchId: z.string().min(4), pricePerKg: z.coerce.number().positive(), pickupDays: z.coerce.number().int().min(0).max(60), paymentTerms: z.string().min(2).max(120) });

export async function GET() {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await ensureUser(user);
  const owned = await db.select({ id: woolBatches.id }).from(woolBatches).where(eq(woolBatches.farmerId, user.sub));
  if (!owned.length) return NextResponse.json({ bids: [] });
  const records = await db.select().from(bids).where(inArray(bids.batchId, owned.map((batch) => batch.id))).orderBy(desc(bids.createdAt));
  return NextResponse.json({ bids: records }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = bidInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid batch, price, pickup time and payment term." }, { status: 400 });
  const db = await ensureUser(user, "buyer");
  const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, parsed.data.batchId)).limit(1);
  if (!batch) return NextResponse.json({ error: "That live batch was not found." }, { status: 404 });
  if (batch.farmerId === user.sub && !(process.env.DEMO_MODE === "true" && user.sub === "demo-farmer")) return NextResponse.json({ error: "A farmer cannot bid on their own wool." }, { status: 403 });
  const id = crypto.randomUUID();
  await db.insert(bids).values({ id, batchId: batch.id, buyerId: user.sub, pricePerKg: parsed.data.pricePerKg, pickupDays: parsed.data.pickupDays, paymentTerms: parsed.data.paymentTerms, status: "active", createdAt: new Date() });
  return NextResponse.json({ bid: { id, ...parsed.data, status: "active" } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = z.object({ bidId: z.string().uuid(), action: z.literal("accept") }).safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid bid action." }, { status: 400 });
  const db = await ensureUser(user);
  const [bid] = await db.select().from(bids).where(eq(bids.id, input.data.bidId)).limit(1);
  if (!bid) return NextResponse.json({ error: "Bid not found." }, { status: 404 });
  const [batch] = await db.select().from(woolBatches).where(and(eq(woolBatches.id, bid.batchId), eq(woolBatches.farmerId, user.sub))).limit(1);
  if (!batch) return NextResponse.json({ error: "Only the batch owner can accept this offer." }, { status: 403 });
  await db.update(bids).set({ status: "accepted" }).where(eq(bids.id, bid.id));
  await db.update(woolBatches).set({ status: "sold", currentOwnerId: bid.buyerId }).where(eq(woolBatches.id, batch.id));
  return NextResponse.json({ ok: true });
}
