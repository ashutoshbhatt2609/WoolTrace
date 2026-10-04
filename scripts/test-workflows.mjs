import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const dir=await mkdtemp(path.join(tmpdir(),"wooltrace-test-"));
const url="file:"+path.join(dir,"test.db").replaceAll("\\","/");
const client=createClient({url});await migrate(drizzle(client),{migrationsFolder:"./drizzle"});
const port=process.env.TEST_PORT||"3124";
const base="http://localhost:"+port,secret=randomBytes(48).toString("hex");
const today=new Date().toISOString().slice(0,10);
const tomorrow=new Date(Date.now()+86400000).toISOString().slice(0,10);
const server=spawn(process.execPath,["--import","./scripts/mock-google-provider.mjs","node_modules/next/dist/bin/next","start","-p",port],{env:{...process.env,WOOLTRACE_TEST_OAUTH:"1",AUTH_SECRET:secret,TURSO_DATABASE_URL:url,TURSO_AUTH_TOKEN:"",APP_BASE_URL:base,DEMO_MODE:"false",GOOGLE_CLIENT_ID:"",GOOGLE_CLIENT_SECRET:""},stdio:["ignore","pipe","pipe"],windowsHide:true});
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
 const landingHTML=await (await fetch(base+"/")).text();
 assert.ok(landingHTML.includes('class="wool-home"')&&landingHTML.includes("From your flock")&&landingHTML.includes("wooltrace-hero.png"),"Landing renders the new layout and original farmer image (including Next.js image URLs)");checks++;
 assert.equal((landingHTML.match(/aria-pressed="(?:true|false)"/g)||[]).length,10,"Landing exposes ten selectable journey chapters");checks++;
 assert.equal((landingHTML.match(/<details(?:\s|>)/g)||[]).length,5,"Landing FAQs use native disclosures");checks++;
 for(const role of ["farmer","buyer","laboratory","transporter","warehouse","processor","brand"]){assert.ok(landingHTML.includes('href="/demo/'+role+'"'),"Landing opens the correct "+role+" demo");checks++;}
 for(const route of ["/dashboard","/workspace/my-wool","/portal/farmer","/profile"]){const r=await fetch(base+route,{redirect:"manual"});const html=await r.text();assert.ok(r.status===307 || (r.status===200 && html.includes('url=/login')),route+" must redirect before private content renders");checks++;}

 // Role-specific pages and legacy demo isolation.
 const roles={farmer:"farmer",buyer:"buyer",lab:"laboratory",processor:"processor",transporter:"transporter",warehouse:"warehouse",brand:"brand"};
 for(const role of ["transporter","warehouse","brand"]){users[role]={sub:"test-"+role,email:role+"@example.test",name:"Test "+role};await api(role,"/api/profile","PATCH",{role});}
 for(const [who,role] of Object.entries(roles)){
  const response=await fetch(base+"/dashboard",{headers:{Cookie:cookie(who)}});
  assert.equal(response.status,200);const html=await response.text();
  const nav=html.match(/<nav aria-label="Workspace navigation">([\s\S]*?)<\/nav>/)?.[1];assert.ok(nav,"Role navigation renders: "+role);
  assert.ok(nav.includes("/portal/"+role));assert.equal(nav.includes('href="/workspace/woolkart"'),role==="buyer");
  assert.equal(nav.includes('href="/workspace/my-wool"'),["farmer","buyer"].includes(role));
  assert.equal(nav.includes('href="/workspace/quality"'),role==="laboratory");checks+=5;
  const mismatch=role==="farmer"?"buyer":"farmer";
  const redirect=await fetch(base+"/portal/"+mismatch,{headers:{Cookie:cookie(who)},redirect:"manual"});
  const redirectHtml=await redirect.text();
  assert.ok(redirect.status===307?new URL(redirect.headers.get("location"),base).pathname==="/portal/"+role:redirect.status===200&&redirectHtml.includes("url=/portal/"+role),"Cross-role page redirects to own portal");checks++;
  assert.equal((await fetch(base+"/demo/"+role)).status,200);checks++;
 }
 const labGuard=await fetch(base+"/workspace/my-wool",{headers:{Cookie:cookie("lab")},redirect:"manual"});assert.ok(labGuard.status===307?new URL(labGuard.headers.get("location"),base).pathname==="/dashboard":labGuard.status===200&&(await labGuard.text()).includes("url=/dashboard"));checks++;
 await api("lab","/api/bids","GET",undefined,403);
 const oldDemo=await fetch(base+"/api/batches",{headers:{Cookie:"wooltrace_demo_session=farmer"}});assert.equal(oldDemo.status,401);checks++;
 const demoEntry=await fetch(base+"/api/auth/demo",{redirect:"manual"});assert.equal(new URL(demoEntry.headers.get("location"),base).pathname,"/demo");checks++;
 assert.equal((await fetch(base+"/demo")).status,200);checks++;
 await api("lab","/api/profile","PATCH",{role:"transporter"});
 assert.equal((await api("lab","/api/batches")).batches.length,0,"Lab invitation must not appear in transporter workspace");checks++;
 await api("lab","/api/profile","PATCH",{role:"laboratory"});
 await api("buyer","/api/profile","PATCH",{role:"farmer"});
 assert.equal((await api("buyer","/api/batches")).batches.length,0,"Purchases must not appear as farm-origin batches");checks++;
 await api("buyer","/api/profile","PATCH",{role:"buyer"});


 // Regression checks for previously reported edge cases.
 await api("farmer","/api/batches","POST",{breed:"Deccani",weight:10,reserve:90,date:tomorrow,farmName:"Test Farm",village:"Test Village",district:"Chitradurga",state:"Karnataka",shearer:"Test Team"},400);
 const validationBatch=(await api("farmer","/api/batches","POST",{breed:"Deccani",weight:10,reserve:90,date:today,farmName:"Validation Farm",village:"Test Village",district:"Chitradurga",state:"Karnataka",shearer:"Test Team"},201)).batch.id;
 const invalidPhoto={batchId:validationBatch,portalRole:"farmer",title:"Complete shearing with photo",location:"Validation Farm",finalWeightKg:10,shearedAt:today,evidenceImageData:"data:image/jpeg;base64,/9j/"};
 await api("farmer","/api/batches/events","POST",invalidPhoto,400);
 await api("farmer","/api/batches/events","POST",{...invalidPhoto,shearedAt:tomorrow,evidenceImageData:"data:image/jpeg;base64,"+jpeg.toString("base64")},400);
 const receipts=await api("farmer","/api/bids");assert.equal(receipts.bids.find(b=>b.id===bid.bid.id).paymentReference,"TEST-12345678");checks++;
 assert.ok(!html.includes("TEST-12345678"),"Public passport must not include the full payment reference");checks++;
 await api("buyer","/api/payments/upi?bidId="+bid.bid.id,"GET",undefined,409);
 await api("buyer","/api/participants","POST",{batchId,email:users.transporter.email,role:"transporter"},201);
 const handoff={batchId,portalRole:"transporter",location:"Test facility",performedAt:today};
 await api("transporter","/api/batches/events","POST",{...handoff,title:"Delivery recorded"},409);
 await api("transporter","/api/batches/events","POST",{...handoff,title:"Pickup recorded"},201);
 await api("transporter","/api/batches/events","POST",{...handoff,title:"Pickup recorded"},409);
 await api("transporter","/api/batches/events","POST",{...handoff,title:"Delivery recorded"},201);
 await api("transporter","/api/batches/events","POST",{...handoff,title:"Pickup recorded"},201);
 const transportRows=await api("transporter","/api/batches");assert.equal(transportRows.batches[0].status,"delivery_recorded","A second pickup must not regress the recorded progress");checks++;
 await api("buyer","/api/participants","POST",{batchId,email:users.processor.email,role:"processor"},201);
 const stage={batchId,portalRole:"processor",location:"Test mill",performedAt:today};
 await api("processor","/api/batches/events","POST",{...stage,title:"Spinning completed"},409);
 for(const title of ["Scouring completed","Carding completed","Spinning completed"])await api("processor","/api/batches/events","POST",{...stage,title},201);
 await api("processor","/api/batches/events","POST",{...stage,title:"Spinning completed"},409);
 await client.batch(Array.from({length:205},(_,i)=>({sql:"INSERT INTO wool_batches (id,farmer_id,breed,sheared_at,weight_kg,status,sale_status,reserve_price,current_owner_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",args:["WT-PAGE-"+String(i).padStart(4,"0"),users.farmer.sub,"Deccani",Date.now(),1,"registered","unlisted",90,users.farmer.sub,i]})),"write");
 const pages=[];let total=0,weight=0;for(let page=1;page<=3;page++){const result=await api("farmer","/api/batches?page="+page+"&limit=100");pages.push(...result.batches.map(b=>b.id));total=result.pagination.total;weight=result.summary.totalWeightKg;if(page===3)assert.equal(result.pagination.hasNext,false);}
 assert.equal(pages.length,207);assert.equal(new Set(pages).size,207);assert.equal(total,207);assert.equal(weight,315);checks+=4;
 await api("farmer","/api/batches?page=0","GET",undefined,400);
 const legacy=createClient({url:"file:"+path.join(dir,"legacy.db").replaceAll("\\","/")});
 try{
  await legacy.executeMultiple(await readFile("drizzle/0000_tranquil_jean_grey.sql","utf8"));
  await legacy.executeMultiple(await readFile("drizzle/0001_thin_mindworm.sql","utf8"));
  await legacy.execute("INSERT INTO users (id,email,name,created_at) VALUES ('old-farmer','oldfarmer@example.test','Old Farmer',1),('old-buyer','oldbuyer@example.test','Old Buyer',1)");
  await legacy.execute("INSERT INTO wool_batches (id,farmer_id,breed,sheared_at,weight_kg,status,reserve_price,current_owner_id,created_at) VALUES ('WT-OLD-COMPLETE','old-farmer','Deccani',1,10,'shearing_complete',90,'old-farmer',1),('WT-OLD-SOLD','old-farmer','Deccani',1,10,'sold',90,'old-buyer',1)");
  await legacy.execute("INSERT INTO bids (id,batch_id,buyer_id,price_per_kg,pickup_days,payment_terms,status,created_at) VALUES ('old-bid','WT-OLD-SOLD','old-buyer',95,3,'UPI','accepted',1)");
  await legacy.executeMultiple(await readFile("drizzle/0002_reliability_and_receipts.sql","utf8"));
  const rows=await legacy.execute("SELECT * FROM wool_batches ORDER BY id");assert.equal(rows.rows[0].completed_at,1);assert.equal(rows.rows[1].sale_status,"legacy_transferred");
  assert.equal((await legacy.execute("SELECT status FROM bids")).rows[0].status,"legacy_transferred");checks+=3;
 }finally{legacy.close();}

 // Google callback routing uses an isolated local provider fixture. No Google
 // account or production database is contacted by these integration checks.
 users.carrier={sub:"test-new-carrier",email:"NEW-CARRIER@example.test",name:"New Carrier"};
 users.existing={sub:"test-existing-partner",email:"existing-partner@example.test",name:"Existing Partner"};
 await api(null,"/api/assignments","GET",undefined,401);
 await api("buyer","/api/participants","POST",{batchId,email:users.carrier.email,role:"transporter"},201);
 async function callback(code,expected){
  const state="local-oauth-state",r=await fetch(base+"/api/auth/google/callback?code="+code+"&state="+state,{redirect:"manual",headers:{Cookie:"wooltrace_oauth_state="+state+"; wooltrace_oauth_verifier=local-test-verifier"}});
  assert.equal(r.status,307);assert.equal(new URL(r.headers.get("location"),base).pathname,expected,"Google callback routes "+code);checks+=2;
  return r;
 }
 await callback("carrier","/portal/transporter");
 const carrierProfile=(await api("carrier","/api/profile")).profile;assert.equal(carrierProfile.role,"transporter");assert.equal(carrierProfile.onboarded,true);checks+=2;
 assert.equal((await api("carrier","/api/batches")).batches[0].id,batchId);checks++;
 assert.equal((await api("carrier","/api/batches?batchId="+validationBatch)).batches.length,0,"A batch-id query cannot bypass invitation scope");checks++;
 await api("carrier","/api/batches","POST",{breed:"Deccani",weight:10,reserve:90,date:today,farmName:"Test Farm",village:"Test Village",district:"Chitradurga",state:"Karnataka",shearer:"Test Team"},403);
 await api("carrier","/api/bids","GET",undefined,403);
 await api("carrier","/api/participants?batchId="+batchId,"GET",undefined,403);
 const carrierAccess=(await api("carrier","/api/assignments")).assignments;assert.equal(carrierAccess.length,1);assert.equal(carrierAccess[0].role,"transporter");checks+=2;
 await api("stranger","/api/assignments","POST",{assignmentId:carrierAccess[0].id},403);
 const opened=await api("carrier","/api/assignments","POST",{assignmentId:carrierAccess[0].id});assert.equal(opened.redirect,"/portal/transporter?batchId="+batchId);checks++;
 await api("carrier","/api/assignments","POST",{assignmentId:carrierAccess[0].id},403,"https://untrusted.example");
 await api("farmer","/api/participants","POST",{batchId:validationBatch,email:users.carrier.email,role:"warehouse"},201);
 await callback("carrier","/assignments");
 const multiple=await api("carrier","/api/assignments?limit=1");assert.equal(multiple.assignments.length,1);assert.equal(multiple.pagination.total,2);assert.equal(multiple.pagination.hasNext,true);checks+=3;
 const allAccess=(await api("carrier","/api/assignments")).assignments,warehouseAccess=allAccess.find(a=>a.role==="warehouse");
 await api("carrier","/api/assignments","POST",{assignmentId:warehouseAccess.id});
 assert.equal((await api("carrier","/api/profile")).profile.role,"warehouse");assert.equal((await api("carrier","/api/batches")).batches[0].id,validationBatch);checks+=2;
 await api("buyer","/api/participants","DELETE",{batchId,id:carrierAccess[0].id});
 await api("carrier","/api/assignments","POST",{assignmentId:carrierAccess[0].id},403);
 await callback("carrier","/portal/warehouse");
 await api("carrier","/api/profile","PATCH",{role:"transporter"});
 await api("carrier","/api/batches/events","POST",{batchId,portalRole:"transporter",title:"Delivery recorded",location:"Local delivery",performedAt:today},403);
 await api("existing","/api/profile","PATCH",{role:"farmer"});
 await api("buyer","/api/participants","POST",{batchId,email:users.existing.email,role:"transporter"},201);
 await callback("existing","/portal/transporter");
 assert.equal((await api("existing","/api/profile")).profile.role,"transporter","Existing accounts also enter their assigned role on Google login");checks++;
 const roleHTML=await (await fetch(base+"/portal/transporter?batchId="+batchId,{headers:{Cookie:cookie("existing")}})).text();assert.ok(roleHTML.includes("Logistics workspace")&&roleHTML.includes("My assignments"));checks++;
 await callback("uninvited","/onboarding");
 await callback("unverified","/login");
 await api("carrier","/api/assignments?page=0","GET",undefined,400);
 assert.ok(landingHTML.includes("wt-sheep-mark")&&landingHTML.includes("wt-flock-doodle"),"Original sheep mark and flock are present on the landing");checks++;
 console.log("PASS: "+checks+" workflow/security checks. Isolated local database only.");
 if(process.argv.includes("--serve")){
  // An opt-in localhost-only UI fixture; it signs fake test accounts, never real
  // Google profiles. It is not imported or exposed by the deployed application.
  const previewPort=Number(port)+1;
  createServer((request,response)=>{
   if(request.headers.host!=="localhost:"+previewPort){response.writeHead(403).end();return;}
   const target=new URL(request.url,"http://localhost:"+previewPort).searchParams.get("account");
   if(target&&["farmer","existing","carrier","buyer"].includes(target)){
    response.writeHead(303,{"Set-Cookie":cookie(target)+"; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600",Location:base+(target==="existing"?"/portal/transporter":"/assignments")}).end();return;
   }
   response.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});
   response.end('<!doctype html><title>Isolated WoolTrace UI preview</title><h1>Local UI test accounts</h1><p>Temporary database. Fake accounts only. No production access.</p><ul>'+["farmer","existing","carrier","buyer"].map(who=>'<li><a href="?account='+who+'">Open '+who+' test account</a></li>').join("")+'</ul>');
  }).listen(previewPort,"127.0.0.1");
  console.log("Isolated local UI preview: http://localhost:"+previewPort+". Public demo: "+base+"/demo");
 }
}catch(error){console.error(error);console.error(logs.slice(-2000));process.exitCode=1;}
finally{client.close();if(!process.argv.includes("--serve")||process.exitCode)server.kill();}
