import "server-only";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getGoogleUser } from "./google-auth";
import { ensureUser } from "./ensure-user";
export async function requireMember(onboarding=true){
 const user=await getGoogleUser();if(!user) redirect("/login");
 const db=await ensureUser(user);
 const [member]=await db.select().from(users).where(eq(users.id,user.sub)).limit(1);
 if(onboarding && !member.onboarded) redirect("/onboarding");
 return {user,member};
}
