import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import QRCode from "qrcode";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { ensureUser } from "@/app/lib/ensure-user";
import { bids, users, woolBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

const upiInput = z.object({
  upiVpa: z.string().trim().min(5).max(120).regex(/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/, "Enter a valid UPI ID."),
  upiName: z.string().trim().min(2).max(80),
});

export async function GET(request: NextRequest) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await ensureUser(user);
  const [profile] = await db.select({ upiVpa: users.upiVpa, upiName: users.upiName }).from(users).where(eq(users.id, user.sub)).limit(1);
  const bidId = request.nextUrl.searchParams.get("bidId");
  if (!bidId) return NextResponse.json({ profile: profile ?? { upiVpa: null, upiName: null } }, { headers: { "Cache-Control": "no-store" } });
  if (!profile?.upiVpa || !profile.upiName) return NextResponse.json({ error: "Add the seller UPI ID before creating a payment QR." }, { status: 409 });

  const [offer] = await db.select({ id: bids.id, batchId: bids.batchId, pricePerKg: bids.pricePerKg, status: bids.status, weightKg: woolBatches.weightKg, farmerId: woolBatches.farmerId })
    .from(bids).innerJoin(woolBatches, eq(bids.batchId, woolBatches.id))
    .where(and(eq(bids.id, bidId), eq(woolBatches.farmerId, user.sub))).limit(1);
  if (!offer) return NextResponse.json({ error: "The accepted offer was not found for this seller." }, { status: 404 });
  if (offer.status !== "accepted") return NextResponse.json({ error: "Accept the buyer offer before creating its payment QR." }, { status: 409 });

  const amount = Number((offer.weightKg * offer.pricePerKg).toFixed(2));
  const params = new URLSearchParams({ pa: profile.upiVpa, pn: profile.upiName, am: amount.toFixed(2), cu: "INR", tn: `WoolTrace ${offer.batchId}`, tr: offer.id });
  const upiUri = `upi://pay?${params.toString()}`;
  const qrDataUrl = await QRCode.toDataURL(upiUri, { width: 360, margin: 2, errorCorrectionLevel: "M", color: { dark: "#102b20", light: "#ffffff" } });
  return NextResponse.json({ payment: { bidId: offer.id, batchId: offer.batchId, amount, upiVpa: profile.upiVpa, upiName: profile.upiName, upiUri, qrDataUrl } }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = upiInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter a valid UPI ID and seller name." }, { status: 400 });
  const db = await ensureUser(user);
  await db.update(users).set({ upiVpa: parsed.data.upiVpa.toLowerCase(), upiName: parsed.data.upiName }).where(eq(users.id, user.sub));
  return NextResponse.json({ profile: { upiVpa: parsed.data.upiVpa.toLowerCase(), upiName: parsed.data.upiName } });
}
