import "server-only";
import { NextResponse } from "next/server";
import { sql, eq } from "drizzle-orm";
import { z } from "zod";
import { getGoogleUser, type GoogleUser } from "./google-auth";
import { ensureUser } from "./ensure-user";
import { rateWindows, users } from "@/db/schema";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export type Member = typeof users.$inferSelect;
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export function api(handler: (request: Request, user: GoogleUser, member: Member) => Promise<Response>) {
  return async (request: Request) => {
    try {
      const user = await getGoogleUser();
      if (!user) throw new ApiError(401, "Please sign in to continue.");
      const db = await ensureUser(user);
      const window = Math.floor(Date.now() / 60000);
      const [rate] = await db.insert(rateWindows).values({ id: user.sub, window, hits: 1 }).onConflictDoUpdate({
        target: rateWindows.id,
        set: { window, hits: sql`CASE WHEN ${rateWindows.window} = ${window} THEN ${rateWindows.hits} + 1 ELSE 1 END` },
      }).returning();
      if (rate.hits > 120) return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429, headers: { "Retry-After": "60" } });
      const [member] = await db.select().from(users).where(eq(users.id, user.sub)).limit(1);
      return await handler(request, user, member);
    } catch (error) {
      if (error instanceof ApiError) return json({ error: error.message }, error.status);
      if (error instanceof z.ZodError) return json({ error: error.issues[0]?.message ?? "Check the form details." }, 400);
      console.error("WoolTrace request failed", error instanceof Error ? error.name : "UnknownError");
      return json({ error: "The service is temporarily unavailable. Please try again." }, 503);
    }
  };
}
export async function body<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError(415, "Send a JSON request.");
  if (Number(request.headers.get("content-length")) > 600000) throw new ApiError(413, "The upload is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "The form was empty.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 600000) { await reader.cancel(); throw new ApiError(413, "The upload is too large."); }
    chunks.push(value);
  }
  let data: unknown;
  try { data = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new ApiError(400, "The form could not be read."); }
  return schema.parse(data);
}
