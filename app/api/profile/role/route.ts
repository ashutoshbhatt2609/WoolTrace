import { eq } from "drizzle-orm";
import { z } from "zod";
import { api, body, json } from "@/app/lib/api";
import { getDb } from "@/db";
import { users } from "@/db/schema";
export const PATCH = api(async (request, user) => {
  const { role } = await body(request, z.object({ role: z.enum(["farmer", "buyer", "laboratory", "transporter", "warehouse", "processor", "brand"]) }).strict());
  await getDb().update(users).set({ role, onboarded: true }).where(eq(users.id, user.sub));
  return json({ role, redirect: "/dashboard" });
});
