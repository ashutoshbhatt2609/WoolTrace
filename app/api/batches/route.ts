import { and, desc, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { api, ApiError, body, json } from "@/app/lib/api";
import { appendEvent, getBatch, requireOwner } from "@/app/lib/batch-access";
import { getDb } from "@/db";
import { batchParticipants, bids, farms, woolBatches } from "@/db/schema";

const input = z.object({
 breed:z.string().trim().min(2).max(80), weight:z.coerce.number().positive().max(100000),
 reserve:z.coerce.number().nonnegative().max(1000000), date:z.coerce.date(),
 farmName:z.string().trim().min(2).max(100), village:z.string().trim().min(2).max(100),
 district:z.string().trim().min(2).max(100), state:z.string().trim().min(2).max(100), shearer:z.string().trim().min(2).max(100)
});
export const GET=api(async(request,user)=>{
 const db=getDb();
 const invites=await db.select({id:batchParticipants.batchId}).from(batchParticipants).where(eq(batchParticipants.email,user.email.toLowerCase()));
 const marketplace=new URL(request.url).searchParams.get("scope")==="marketplace";
 const records=await db.select().from(woolBatches).where(marketplace ? eq(woolBatches.saleStatus,"listed") : or(eq(woolBatches.farmerId,user.sub),eq(woolBatches.currentOwnerId,user.sub),inArray(woolBatches.id,invites.map(i=>i.id)))).orderBy(desc(woolBatches.createdAt)).limit(200);
 const offers=records.length ? await db.select({batchId:bids.batchId}).from(bids).where(and(inArray(bids.batchId,records.map(b=>b.id)),eq(bids.status,"active"))) : [];
 return json({batches:records.map(b=>({...b,weight:b.weightKg,price:b.reservePrice,source:"live",isOwner:b.currentOwnerId===user.sub,isFarmer:b.farmerId===user.sub,bids:offers.filter(o=>o.batchId===b.id).length}))});
});
export const POST=api(async(request,user,member)=>{
 if(member.role!=="farmer") throw new ApiError(403,"Choose the farmer role in your profile to register wool.");
 const data=await body(request,input);
 if(data.date.getTime()>Date.now()+86400000) throw new ApiError(400,"The shearing start date cannot be in the future.");
 const id="WT-"+crypto.randomUUID().toUpperCase();
 await getDb().transaction(async tx=>{
  const farmId=crypto.randomUUID();
  await tx.insert(farms).values({id:farmId,ownerId:user.sub,name:data.farmName,village:data.village,district:data.district,state:data.state});
  await tx.insert(woolBatches).values({id,farmerId:user.sub,farmId,breed:data.breed,shearedAt:data.date,weightKg:data.weight,reservePrice:data.reserve,currentOwnerId:user.sub,status:"shearing_started",createdAt:new Date()});
  await appendEvent(tx,{batchId:id,eventType:"shearing_started",title:"Shearing started",actorId:user.sub,actorRole:"farmer",location:[data.farmName,data.village,data.district,data.state].join(", "),notes:"Farmer-reported start: "+data.date.toISOString().slice(0,10)+". Shearer/team: "+data.shearer+". Expected weight: "+data.weight+" kg."});
 });
 return json({batch:{id}},201);
});
export const PATCH=api(async(request,user)=>{
 const data=await body(request,z.object({batchId:z.string(),reserve:z.coerce.number().nonnegative().max(1000000),listed:z.boolean()}));
 await getDb().transaction(async tx=>{
  const batch=await getBatch(tx,data.batchId); requireOwner(batch,user.sub);
  if(batch.farmerId!==user.sub) throw new ApiError(403,"Only the source farmer can list this batch.");
  if(!batch.completedAt) throw new ApiError(409,"Complete shearing with a photo before listing.");
  if(["accepted","paid"].includes(batch.saleStatus)) throw new ApiError(409,"This batch already has an accepted sale.");
  await tx.update(woolBatches).set({reservePrice:data.reserve,saleStatus:data.listed?"listed":"unlisted"}).where(eq(woolBatches.id,batch.id));
  await appendEvent(tx,{batchId:batch.id,eventType:"listing_updated",title:data.listed?"Batch listed for direct offers":"Batch removed from marketplace",actorId:user.sub,actorRole:"farmer",notes:"Reserve price: ₹"+data.reserve+"/kg."});
 });
 return json({ok:true});
});
