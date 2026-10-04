import { and, count, desc, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { api, ApiError, body, json } from "@/app/lib/api";
import { appendEvent, getBatch, requireOwner } from "@/app/lib/batch-access";
import { getDb } from "@/db";
import { bids, paymentReceipts, woolBatches } from "@/db/schema";
import { pageInput, pageInfo } from "@/app/lib/pagination";

export const GET=api(async(request,user,member)=>{
 if(!["farmer","buyer"].includes(member.role))throw new ApiError(403,"Offers are available in farmer and buyer workspaces.");
 const scope=member.role==="farmer"?eq(woolBatches.farmerId,user.sub):eq(bids.buyerId,user.sub);
 const {page,limit,offset}=pageInput(request);
 const [summary]=await getDb().select({total:count(),openOffers:sql<number>`coalesce(sum(case when ${bids.status} in ('active','accepted') then 1 else 0 end),0)`}).from(bids).innerJoin(woolBatches,eq(bids.batchId,woolBatches.id)).where(scope);
 const records=await getDb().select({id:bids.id,batchId:bids.batchId,buyerId:bids.buyerId,pricePerKg:bids.pricePerKg,pickupDays:bids.pickupDays,paymentTerms:bids.paymentTerms,status:bids.status,createdAt:bids.createdAt,sellerId:woolBatches.farmerId,weightKg:woolBatches.weightKg,paymentReference:paymentReceipts.reference,paidAt:paymentReceipts.confirmedAt}).from(bids).innerJoin(woolBatches,eq(bids.batchId,woolBatches.id)).leftJoin(paymentReceipts,eq(paymentReceipts.bidId,bids.id)).where(scope).orderBy(desc(bids.createdAt),desc(bids.id)).limit(limit).offset(offset);
 return json({bids:records.map(b=>({...b,isSeller:b.sellerId===user.sub})),summary,pagination:pageInfo(page,limit,summary.total)});
});
export const POST=api(async(request,user,member)=>{
 if(member.role!=="buyer") throw new ApiError(403,"Select the buyer role in your profile to make offers.");
 const data=await body(request,z.object({batchId:z.string().min(4),pricePerKg:z.coerce.number().positive().max(1000000),pickupDays:z.coerce.number().int().min(0).max(60),paymentTerms:z.string().trim().min(2).max(120)}));
 const id=crypto.randomUUID();
 await getDb().transaction(async tx=>{
  const batch=await getBatch(tx,data.batchId);
  if(batch.farmerId===user.sub) throw new ApiError(403,"You cannot bid on your own wool.");
  if(batch.saleStatus!=="listed") throw new ApiError(409,"This batch is not open for offers.");
  if(data.pricePerKg<batch.reservePrice) throw new ApiError(400,"Your offer must meet the reserve price.");
  const [existing]=await tx.select().from(bids).where(and(eq(bids.batchId,batch.id),eq(bids.buyerId,user.sub),eq(bids.status,"active"))).limit(1);
  if(existing) throw new ApiError(409,"You already have an active offer. Withdraw it before making another.");
  await tx.insert(bids).values({id,...data,buyerId:user.sub,status:"active",createdAt:new Date()});
 });
 return json({bid:{id,...data,status:"active"}},201);
});
export const PATCH=api(async(request,user)=>{
 const data=await body(request,z.object({bidId:z.string().uuid(),action:z.enum(["accept","withdraw","confirm_payment","cancel_sale"]),reference:z.string().trim().min(6).max(80).optional()}));
 await getDb().transaction(async tx=>{
  const [bid]=await tx.select().from(bids).where(eq(bids.id,data.bidId)).limit(1);
  if(!bid) throw new ApiError(404,"Offer not found.");
  const batch=await getBatch(tx,bid.batchId);
  if(data.action==="withdraw"){
   if(bid.buyerId!==user.sub) throw new ApiError(403,"Only the buyer can withdraw this offer.");
   if(bid.status!=="active") throw new ApiError(409,"Only an active offer can be withdrawn.");
   await tx.update(bids).set({status:"withdrawn"}).where(eq(bids.id,bid.id)); return;
  }
  requireOwner(batch,user.sub);
  if(batch.farmerId!==user.sub) throw new ApiError(403,"Only the source seller can confirm this sale.");
  if(data.action==="cancel_sale"){
   if(bid.status!=="accepted" || batch.saleStatus!=="accepted") throw new ApiError(409,"Only an unpaid accepted sale can be cancelled.");
   await tx.update(bids).set({status:"cancelled"}).where(eq(bids.id,bid.id));
   await tx.update(woolBatches).set({saleStatus:"unlisted"}).where(eq(woolBatches.id,batch.id));
   await appendEvent(tx,{batchId:batch.id,eventType:"sale_cancelled",title:"Seller cancelled the unpaid sale",actorId:user.sub,actorRole:"farmer",notes:"Ownership remains with the farmer. The batch is not currently listed."});
   return;
  }
  if(data.action==="accept"){
   if(bid.status!=="active" || batch.saleStatus!=="listed") throw new ApiError(409,"This offer is no longer available.");
   await tx.update(bids).set({status:"accepted"}).where(eq(bids.id,bid.id));
   await tx.update(bids).set({status:"not_selected"}).where(and(eq(bids.batchId,batch.id),ne(bids.id,bid.id),eq(bids.status,"active")));
   await tx.update(woolBatches).set({saleStatus:"accepted"}).where(eq(woolBatches.id,batch.id));
   await appendEvent(tx,{batchId:batch.id,eventType:"offer_accepted",title:"Seller accepted a buyer offer",actorId:user.sub,actorRole:"farmer",notes:"Payment and handover are pending. Price ₹"+bid.pricePerKg+"/kg."});
  }else{
   if(!data.reference) throw new ApiError(400,"Enter the transaction reference after checking your bank account.");
   if(bid.status!=="accepted" || batch.saleStatus!=="accepted") throw new ApiError(409,"Only an accepted, unpaid offer can be confirmed.");
   await tx.update(bids).set({status:"paid"}).where(eq(bids.id,bid.id));
   await tx.insert(paymentReceipts).values({id:crypto.randomUUID(),bidId:bid.id,reference:data.reference,amount:Math.round(bid.pricePerKg*batch.weightKg*100)/100,confirmedBy:user.sub,confirmedAt:new Date()});
   await tx.update(woolBatches).set({saleStatus:"paid",currentOwnerId:bid.buyerId}).where(eq(woolBatches.id,batch.id));
   await appendEvent(tx,{batchId:batch.id,eventType:"payment_confirmed",title:"Seller confirmed payment and transferred ownership",actorId:user.sub,actorRole:"farmer",notes:"Payment confirmed manually by seller, not by a bank integration. Reference ending "+data.reference.slice(-4)+"."});
  }
 });
 return json({ok:true});
});
