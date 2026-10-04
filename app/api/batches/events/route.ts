import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { api, ApiError, body, json } from "@/app/lib/api";
import { appendEvent, getBatch, requireParticipant } from "@/app/lib/batch-access";
import { getDb } from "@/db";
import { batchEvents, woolBatches } from "@/db/schema";
import { indiaToday, pastDate } from "@/app/lib/dates";
import { validatePhoto } from "@/app/lib/image-evidence";
import { nextLifecycleStatus } from "@/app/lib/lifecycle";

const allowed:Record<string,string[]>={
 farmer:["Complete shearing with photo"], buyer:["Wool received"],
 laboratory:["Sample received"], transporter:["Pickup recorded","Delivery recorded"],
 warehouse:["Storage intake","Storage released"], processor:["Scouring completed","Carding completed","Spinning completed","Weaving completed","Dyeing completed"],
 brand:["Finished product recorded"]
};
export const POST=api(async(request,user,member)=>{
 const data=await body(request,z.object({batchId:z.string().min(4),portalRole:z.string(),title:z.string(),location:z.string().trim().min(2).max(160),notes:z.string().trim().max(500).optional(),evidenceImageData:z.string().max(500000).optional(),finalWeightKg:z.coerce.number().positive().max(100000).optional(),shearedAt:pastDate.optional(),performedAt:pastDate.optional()}));
 if(member.role!==data.portalRole || !allowed[member.role]?.includes(data.title)) throw new ApiError(403,"This action is not available for your role.");
 let photo:string|undefined;
 await getDb().transaction(async tx=>{
  const batch=await getBatch(tx,data.batchId);
  await requireParticipant(tx,batch,user,member.role);
  const complete=data.title==="Complete shearing with photo";
  if(complete){
   if(batch.completedAt || batch.saleStatus!=="unlisted") throw new ApiError(409,"Shearing is already complete or the batch is listed.");
   if(!data.finalWeightKg || !data.shearedAt || !data.evidenceImageData) throw new ApiError(400,"Add the completion date, final weight and a photo.");
   photo=await validatePhoto(data.evidenceImageData);
   if(indiaToday(data.shearedAt)<indiaToday(batch.shearedAt)) throw new ApiError(400,"Completion must be on or after the shearing start date.");
   await tx.update(woolBatches).set({status:"shearing_complete",weightKg:data.finalWeightKg,completedAt:data.shearedAt}).where(eq(woolBatches.id,batch.id));
  }else{
   if(!batch.completedAt) throw new ApiError(409,"Shearing must be completed first.");
   const history=await tx.select().from(batchEvents).where(eq(batchEvents.batchId,batch.id)).orderBy(asc(batchEvents.occurredAt));
   const performedAt=data.performedAt??new Date();
   if(indiaToday(performedAt)<indiaToday(batch.completedAt))throw new ApiError(400,"The stage date cannot be before shearing was completed.");
   await tx.update(woolBatches).set({status:nextLifecycleStatus(batch.status,data.title,history,performedAt)}).where(eq(woolBatches.id,batch.id));
  }
  await appendEvent(tx,{batchId:batch.id,eventType:complete?"shearing_complete":member.role+":"+data.title.toLowerCase().replaceAll(" ","_"),title:data.title,actorId:user.sub,actorRole:member.role,location:data.location,notes:complete?"Farmer-reported completion: "+data.shearedAt!.toISOString().slice(0,10)+". Final weight: "+data.finalWeightKg+" kg. "+(data.notes??""):data.notes,evidenceImageData:complete?photo:undefined,performedAt:complete?data.shearedAt:data.performedAt});
 });
 return json({ok:true},201);
});
