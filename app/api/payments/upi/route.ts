import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { z } from "zod";
import { api, ApiError, body, json } from "@/app/lib/api";
import { getDb } from "@/db";
import { bids, users, woolBatches } from "@/db/schema";
export const GET=api(async(request,user,member)=>{
 const id=new URL(request.url).searchParams.get("bidId");
 if(!id) return json({profile:{upiVpa:member.upiVpa,upiName:member.upiName}});
 const [offer]=await getDb().select({id:bids.id,batchId:bids.batchId,buyerId:bids.buyerId,price:bids.pricePerKg,status:bids.status,weight:woolBatches.weightKg,sellerId:woolBatches.farmerId,upiVpa:users.upiVpa,upiName:users.upiName}).from(bids).innerJoin(woolBatches,eq(woolBatches.id,bids.batchId)).innerJoin(users,eq(users.id,woolBatches.farmerId)).where(eq(bids.id,id)).limit(1);
 if(!offer || ![offer.sellerId,offer.buyerId].includes(user.sub)) throw new ApiError(404,"Offer not found.");
 if(!["accepted","paid"].includes(offer.status)) throw new ApiError(409,"This offer has not been accepted.");
 if(!offer.upiVpa || !offer.upiName) throw new ApiError(409,"The seller needs to save their UPI payment details.");
 const amount=Number((offer.price*offer.weight).toFixed(2));
 const upiUri="upi://pay?"+new URLSearchParams({pa:offer.upiVpa,pn:offer.upiName,am:amount.toFixed(2),cu:"INR",tn:"WoolTrace "+offer.batchId,tr:offer.id}).toString();
 const qrDataUrl=await QRCode.toDataURL(upiUri,{width:360,margin:2,errorCorrectionLevel:"M"});
 return json({payment:{bidId:offer.id,batchId:offer.batchId,amount,upiVpa:offer.upiVpa,upiName:offer.upiName,upiUri,qrDataUrl}});
});
export const PATCH=api(async(request,user)=>{
 const data=await body(request,z.object({upiVpa:z.string().trim().min(5).max(120).regex(/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/,"Enter a valid UPI ID."),upiName:z.string().trim().min(2).max(80)}));
 await getDb().update(users).set(data).where(eq(users.id,user.sub));return json({profile:data});
});
