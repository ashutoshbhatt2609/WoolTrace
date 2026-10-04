import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const dir=await mkdtemp(path.join(tmpdir(),"wooltrace-test-"));
const url="file:"+path.join(dir,"test.db").replaceAll("\\","/");
const client=createClient({url});await migrate(drizzle(client),{migrationsFolder:"./drizzle"});
const base="http://localhost:3123",secret=randomBytes(48).toString("hex");
const today=new Date().toISOString().slice(0,10);
const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3123"],{env:{...process.env,AUTH_SECRET:secret,TURSO_DATABASE_URL:url,TURSO_AUTH_TOKEN:"",APP_BASE_URL:base,DEMO_MODE:"true",GOOGLE_CLIENT_ID:"test",GOOGLE_CLIENT_SECRET:"test"},stdio:["ignore","pipe","pipe"],windowsHide:true});
let logs="";server.stdout.on("data",d=>logs+=d);server.stderr.on("data",d=>logs+=d);
const users={farmer:{sub:"test-farmer",email:"farmer@example.test",name:"Test Farmer"},buyer:{sub:"test-buyer",email:"buyer@example.test",name:"Test Buyer"},stranger:{sub:"test-stranger",email:"stranger@example.test",name:"Other Farmer"},lab:{sub:"test-lab",email:"lab@example.test",name:"Test Lab"},processor:{sub:"test-processor",email:"processor@example.test",name:"Test Processor"}};
function cookie(who){const payload=Buffer.from(JSON.stringify({...users[who],exp:Date.now()+3600000})).toString("base64url");return "wooltrace_session="+payload+"."+createHmac("sha256",secret).update(payload).digest("base64url");}
let checks=0;
async function api(who,route,method="GET",data,expected=200,origin=base){
 const response=await fetch(base+route,{method,headers:{"Content-Type":"application/json",...(who?{Cookie:cookie(who)}:{}),Origin:origin},body:data===undefined?undefined:JSON.stringify(data),redirect:"manual"});
 const text=await response.text();assert.equal(response.status,expected,method+" "+route+": "+text.slice(0,350));checks++;return text?JSON.parse(text):null;
}
try{
 let ready=false;for(let i=0;i<90;i++){try{if((await fetch(base+"/login")).ok){ready=true;break;}}catch{}await delay(1000);}assert.ok(ready,"Server failed to start: "+logs.slice(-1500));
 await api(null,"/api/batches","GET",undefined,401);
 for(const [who,role] of [["farmer","farmer"],["buyer","buyer"],["stranger","farmer"],["lab","laboratory"],["processor","processor"]])await api(who,"/api/profile","PATCH",{role,organisation:"Local test"});
 await api("farmer","/api/profile","PATCH",{role:"farmer"},403,"https://untrusted.example");
 const created=await api("farmer","/api/batches","POST",{breed:"Deccani",weight:100,reserve:90,date:today,farmName:"Test Farm",village:"Test Village",district:"Chitradurga",state:"Karnataka",shearer:"Test Team"},201);
 const batchId=created.batch.id;
 await api("stranger","/api/batches","PATCH",{batchId,reserve:90,listed:true},403);
 await api("farmer","/api/batches","PATCH",{batchId,reserve:90,listed:true},409);
 const event={batchId,portalRole:"farmer",title:"Complete shearing with photo",location:"Test Farm",finalWeightKg:100,shearedAt:today};
 await api("farmer","/api/batches/events","POST",event,400);
 await api("stranger","/api/batches/events","POST",{...event,evidenceImageData:"data:image/jpeg;base64,/9j/2Q=="},403);
 await api("farmer","/api/batches/events","POST",{...event,evidenceImageData:"data:image/svg+xml;base64,PHN2Zy8+"},400);
 // Use the existing hero image as local test evidence; no production service is contacted.
 const sharp=(await import("sharp")).default;
 const jpeg=await sharp("public/wooltrace-hero.png").resize(100,100).jpeg().toBuffer();
 await api("farmer","/api/batches/events","POST",{...event,evidenceImageData:"data:image/jpeg;base64,"+jpeg.toString("base64")},201);
 await api("farmer","/api/batches/events","POST",{...event,evidenceImageData:"data:image/jpeg;base64,"+jpeg.toString("base64")},409);
 await api("farmer","/api/batches","PATCH",{batchId,reserve:90,listed:true});
 const quality={batchId,grade:"B",micron:32,stapleMm:54,location:"Test Lab"};
 await api("lab","/api/batches/quality","POST",quality,403);
 await api("farmer","/api/participants","POST",{batchId,email:users.lab.email,role:"laboratory"},201);
 await api("lab","/api/batches/quality","POST",quality,201);
 const bidder={batchId,pricePerKg:95,pickupDays:3,paymentTerms:"UPI before pickup"};
 await api("buyer","/api/bids","POST",{...bidder,pricePerKg:80},400);
 let bid=await api("buyer","/api/bids","POST",bidder,201);
 await api("buyer","/api/bids","POST",bidder,409);
 await api("stranger","/api/bids","PATCH",{bidId:bid.bid.id,action:"accept"},403);
 await api("farmer","/api/bids","PATCH",{bidId:bid.bid.id,action:"accept"});
 await api("farmer","/api/bids","PATCH",{bidId:bid.bid.id,action:"accept"},409);
 await api("stranger","/api/bids","PATCH",{bidId:bid.bid.id,action:"cancel_sale"},403);
 await api("farmer","/api/bids","PATCH",{bidId:bid.bid.id,action:"cancel_sale"});
 await api("buyer","/api/payments/upi?bidId="+bid.bid.id,"GET",undefined,409);
 await api("farmer","/api/batches","PATCH",{batchId,reserve:90,listed:true});
 bid=await api("buyer","/api/bids","POST",bidder,201);
 await api("farmer","/api/bids","PATCH",{bidId:bid.bid.id,action:"accept"});
 const stillOwned=await api("farmer","/api/batches");assert.ok(stillOwned.batches.find(b=>b.id===batchId).isOwner);checks++;
 await api("buyer","/api/payments/upi?bidId="+bid.bid.id,"GET",undefined,409);
 await api("farmer","/api/payments/upi","PATCH",{upiVpa:"test-seller@upi",upiName:"Test Farmer"});
 const payment=await api("buyer","/api/payments/upi?bidId="+bid.bid.id);assert.equal(payment.payment.amount,9500);assert.equal(payment.payment.upiVpa,"test-seller@upi");checks+=2;
 await api("stranger","/api/payments/upi?bidId="+bid.bid.id,"GET",undefined,404);
 await api("farmer","/api/bids","PATCH",{bidId:bid.bid.id,action:"confirm_payment"},400);
 await api("farmer","/api/bids","PATCH",{bidId:bid.bid.id,action:"confirm_payment",reference:"TEST-12345678"});
 await api("farmer","/api/bids","PATCH",{bidId:bid.bid.id,action:"confirm_payment",reference:"TEST-12345678"},403);
 const buyerBatches=await api("buyer","/api/batches");assert.ok(buyerBatches.batches.find(b=>b.id===batchId).isOwner);checks++;
 await api("farmer","/api/participants","POST",{batchId,email:users.processor.email,role:"processor"},403);
 await api("buyer","/api/participants","POST",{batchId,email:users.processor.email,role:"processor"},201);
 const lot=await api("processor","/api/lots","POST",{batchId,name:"Test yarn",kind:"yarn",weightKg:80},201);
 await api("processor","/api/lots","POST",{batchId,name:"Too much yarn",kind:"yarn",weightKg:21},409);
 await api("processor","/api/lots","POST",{batchId,parentLotId:lot.lot.id,name:"Test fabric",kind:"fabric",weightKg:70},201);
 await api("processor","/api/lots","POST",{batchId,parentLotId:lot.lot.id,name:"Excess fabric",kind:"fabric",weightKg:11},409);
 const passport=await fetch(base+"/batch/"+batchId);const html=await passport.text();assert.equal(passport.status,200);assert.ok(html.includes("Test Farmer")&&html.includes("Test Buyer")&&html.includes("Recorded event chain matches"));checks+=2;
 assert.equal((await fetch(base+"/lot/"+lot.lot.id)).status,200);checks++;
 const planned=await api("buyer","/api/bookings","POST",{batchId,kind:"transport",providerName:"Test transporter",scheduledAt:tomorrow},201);
 await api("stranger","/api/bookings","DELETE",{id:planned.booking.id},404);
 await api("buyer","/api/bookings","DELETE",{id:planned.booking.id});
 const invites=await api("buyer","/api/participants?batchId="+batchId);const access=invites.participants.find(i=>i.email===users.processor.email);
 await api("buyer","/api/participants","DELETE",{batchId,id:access.id});
 await api("processor","/api/batches/events","POST",{batchId,portalRole:"processor",title:"Spinning completed",location:"Test facility"},403);
 for(const route of ["/","/login","/privacy","/terms","/labs","/batch/WT-2610-KAR"]){assert.equal((await fetch(base+route)).status,200,route);checks++;}
 for(const route of ["/dashboard","/workspace/my-wool","/portal/farmer","/profile"]){const r=await fetch(base+route,{redirect:"manual"});const html=await r.text();assert.ok(r.status===307 || (r.status===200 && html.includes('url=/login')),route+" must redirect before private content renders");checks++;}
 console.log("PASS: "+checks+" workflow/security checks. Isolated local database only.");
 if(process.argv.includes("--serve"))console.log("Local UI test server remains available at "+base+" (demo mode enabled, temporary database).");
}catch(error){console.error(error);console.error(logs.slice(-2000));process.exitCode=1;}
finally{client.close();if(!process.argv.includes("--serve")||process.exitCode)server.kill();}
