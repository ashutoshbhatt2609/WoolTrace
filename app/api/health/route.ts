import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users, woolBatches, productLots, batchParticipants, rateWindows } from "@/db/schema";
import { googleAuthConfigured } from "@/app/lib/google-auth";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  if(!googleAuthConfigured() || process.env.DEMO_MODE==="true")throw new Error("Configuration incomplete");
  const db=getDb();
  await Promise.all([db.select({onboarded:users.onboarded}).from(users).limit(1),db.select({sale:woolBatches.saleStatus}).from(woolBatches).limit(1),db.select({id:productLots.id}).from(productLots).limit(1),db.select({id:batchParticipants.id}).from(batchParticipants).limit(1),db.select({id:rateWindows.id}).from(rateWindows).limit(1)]);
  return NextResponse.json({status:"ok"},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({status:"unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
