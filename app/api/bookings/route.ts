import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { api, ApiError, body, json } from "@/app/lib/api";
import { getBatch, requireOwner } from "@/app/lib/batch-access";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";
export const GET=api(async(_request,user)=>json({bookings:await getDb().select().from(bookings).where(eq(bookings.userId,user.sub)).orderBy(desc(bookings.scheduledAt)).limit(200)}));
export const POST=api(async(request,user)=>{
 const data=await body(request,z.object({batchId:z.string().optional(),kind:z.enum(["transport","warehouse","shearing","veterinary","quality","processing"]),providerName:z.string().trim().min(2).max(120),scheduledAt:z.coerce.date()}));
 if(data.scheduledAt.getTime()<Date.now()-86400000) throw new ApiError(400,"Choose today or a future date.");
 const id=crypto.randomUUID();
 await getDb().transaction(async tx=>{
  if(data.batchId) requireOwner(await getBatch(tx,data.batchId),user.sub);
  await tx.insert(bookings).values({...data,batchId:data.batchId||null,id,userId:user.sub,status:"planned"});
 });
 return json({booking:{id,...data,status:"planned"}},201);
});
export const DELETE=api(async(request,user)=>{
 const data=await body(request,z.object({id:z.string().uuid()}));
 const changed=await getDb().update(bookings).set({status:"cancelled"}).where(and(eq(bookings.id,data.id),eq(bookings.userId,user.sub))).returning();
 if(!changed.length) throw new ApiError(404,"Service plan not found.");
 return json({ok:true});
});
