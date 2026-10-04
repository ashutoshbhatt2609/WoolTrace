import { eq } from "drizzle-orm";
import { z } from "zod";
import { api, body, json } from "@/app/lib/api";
import { getDb } from "@/db";
import { users } from "@/db/schema";
const profileInput = z.object({
  role: z.enum(["farmer", "buyer", "laboratory", "transporter", "warehouse", "processor", "brand"]),
  organisation: z.string().trim().max(120).default(""),
});
export const GET = api(async (_request, _user, member) => json({ profile: member }));
export const PATCH = api(async (request, user) => {
  const input = await body(request, profileInput);
  await getDb().update(users).set({ ...input, onboarded: true }).where(eq(users.id, user.sub));
  return json({ ok: true });
});
