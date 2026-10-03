import { eq } from "drizzle-orm";
import { z } from "zod";
import { api, ApiError, body, json } from "@/app/lib/api";
import { appendEvent, getBatch, requireParticipant } from "@/app/lib/batch-access";
import { getDb } from "@/db";
import { woolBatches } from "@/db/schema";
export const POST=api(async(request,user,member)=>{
 if(member.role!=="laboratory") throw new ApiError(403,"Only an invited laboratory account can record measurements.");
 const data=await body(request,z.object({batchId:z.string().min(4),grade:z.string().trim().min(1).max(30),micron:z.coerce.number().positive().max(100),stapleMm:z.coerce.number().positive().max(500),location:z.string().trim().min(2).max(140)}));
 await getDb().transaction(async tx=>{
  const batch=await getBatch(tx,data.batchId); await requireParticipant(tx,batch,user,"laboratory");
  if(!batch.completedAt) throw new ApiError(409,"Complete shearing before recording measurements.");
  await tx.update(woolBatches).set({grade:data.grade,micron:data.micron,stapleMm:data.stapleMm}).where(eq(woolBatches.id,batch.id));
  await appendEvent(tx,{batchId:batch.id,eventType:"quality_recorded",title:"Laboratory measurements recorded",actorId:user.sub,actorRole:"laboratory",location:data.location,notes:"Grade "+data.grade+"; "+data.micron+" micron; "+data.stapleMm+" mm staple. Submitted by the invited laboratory; not independently certified by WoolTrace."});
 });
 return json({ok:true},201);
});
