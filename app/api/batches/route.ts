import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser } from "@/app/lib/google-auth";
import { getDb } from "@/db";
import { batchEvents, users, woolBatches } from "@/db/schema";

export const dynamic = "force-dynamic";

const batchInput = z.object({
  breed: z.string().trim().min(2).max(80),
  weight: z.coerce.number().positive().max(100000),
  reserve: z.coerce.number().nonnegative().max(1000000),
  date: z.coerce.date(),
});

export async function GET(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const marketplace = new URL(request.url).searchParams.get("scope") === "marketplace";
  const records = marketplace
    ? await db.select().from(woolBatches).orderBy(desc(woolBatches.createdAt)).limit(50)
    : await db.select().from(woolBatches).where(eq(woolBatches.farmerId, user.sub)).orderBy(desc(woolBatches.createdAt));
  return NextResponse.json({ batches: records.map(toDashboardBatch) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = batchInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid breed, weight, reserve price and shearing date." }, { status: 400 });
  }

  const now = new Date();
  const batchId = `WT-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
  const db = getDb();

  await db.insert(users).values({
    id: user.sub,
    email: user.email,
    name: user.name,
    picture: user.picture ?? null,
    role: "farmer",
    locale: "en",
    createdAt: now,
  }).onConflictDoUpdate({
    target: users.id,
    set: { email: user.email, name: user.name, picture: user.picture ?? null },
  });

  await db.insert(woolBatches).values({
    id: batchId,
    farmerId: user.sub,
    breed: parsed.data.breed,
    shearedAt: parsed.data.date,
    weightKg: parsed.data.weight,
    grade: "Pending",
    status: "registered",
    reservePrice: parsed.data.reserve,
    currentOwnerId: user.sub,
    createdAt: now,
  });

  await db.insert(batchEvents).values({
    id: crypto.randomUUID(),
    batchId,
    eventType: "registered",
    title: "Batch registered at shearing",
    actorId: user.sub,
    notes: "Digital passport created by the farmer.",
    occurredAt: now,
  });

  return NextResponse.json({
    batch: {
      id: batchId,
      breed: parsed.data.breed,
      weight: parsed.data.weight,
      grade: "Pending",
      status: "Registered",
      bids: 0,
      price: parsed.data.reserve,
      source: "live",
    },
  }, { status: 201 });
}

function toDashboardBatch(batch: typeof woolBatches.$inferSelect) {
  return {
    id: batch.id,
    breed: batch.breed,
    weight: batch.weightKg,
    grade: batch.grade,
    status: batch.status.replace(/(^|_)([a-z])/g, (_, space, letter) => `${space ? " " : ""}${letter.toUpperCase()}`),
    bids: 0,
    price: batch.reservePrice,
    source: "live" as const,
  };
}
