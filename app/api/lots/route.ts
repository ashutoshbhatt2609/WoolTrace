import { eq } from "drizzle-orm";
import { z } from "zod";
import { api, ApiError, body, json } from "@/app/lib/api";
import { appendEvent, getBatch, requireParticipant } from "@/app/lib/batch-access";
import { getDb } from "@/db";
import { productLots } from "@/db/schema";
export const GET=api(async(request)=>{
 const id=new URL(request.url).searchParams.get("batchId");
 if(!id) throw new ApiError(400,"Choose a batch.");
 return json({lots:await getDb().select().from(productLots).where(eq(productLots.batchId,id))});
});
export const POST=api(async(request,user,member)=>{
 if(!["processor","brand"].includes(member.role)) throw new ApiError(403,"Only invited processors or brands can create product lots.");
 const data=await body(request,z.object({batchId:z.string().min(4),parentLotId:z.string().optional(),name:z.string().trim().min(2).max(100),kind:z.enum(["clean_wool","yarn","fabric","product"]),weightKg:z.coerce.number().positive().max(100000)}));
 const id="LOT-"+crypto.randomUUID().toUpperCase();
 await getDb().transaction(async tx=>{
  const batch=await getBatch(tx,data.batchId);await requireParticipant(tx,batch,user,member.role);
  if(!batch.completedAt) throw new ApiError(409,"Complete shearing first.");
  const lots=await tx.select().from(productLots).where(eq(productLots.batchId,batch.id));
  const parent=data.parentLotId?lots.find(l=>l.id===data.parentLotId):null;
  if(data.parentLotId && !parent) throw new ApiError(400,"Parent lot must belong to this batch.");
  const order=["clean_wool","yarn","fabric","product"];
  if(parent && order.indexOf(data.kind)<=order.indexOf(parent.kind)) throw new ApiError(400,"The new lot must be a later processing stage.");
  const allocated=lots.filter(l=>(l.parentLotId??null)===(data.parentLotId||null)).reduce((sum,l)=>sum+l.weightKg,0);
  if(allocated+data.weightKg>(parent?.weightKg??batch.weightKg)+0.000001) throw new ApiError(409,"Child lots exceed the available parent weight. Account for processing loss.");
  await tx.insert(productLots).values({...data,parentLotId:data.parentLotId||null,id,createdBy:user.sub,createdAt:new Date()});
  await appendEvent(tx,{batchId:batch.id,eventType:"lot_created",title:"Traceable "+data.kind.replaceAll("_"," ")+" lot created",actorId:user.sub,actorRole:member.role,notes:data.name+" · "+data.weightKg+" kg · "+id+(parent?" · parent "+parent.id:" · source batch")});
 });
 return json({lot:{id}},201);
});
