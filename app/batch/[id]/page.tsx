import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import QRCode from "qrcode";
import { Sprout, ArrowLeft, MapPin } from "lucide-react";
import { getDb } from "@/db";
import { batchEvents, farms, productLots, users, woolBatches } from "@/db/schema";
import { hashBatchEvent, hashEvidence } from "@/app/lib/event-integrity";
import { appBaseUrl } from "@/app/lib/integration-config";
import PassportActions from "./passport-actions";
export const dynamic="force-dynamic";
const date=(value:Date)=>value.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric",timeZone:"Asia/Kolkata"});
export default async function BatchPassport({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const sample=id==="WT-2610-KAR";
 let record={breed:"Deccani",grade:"Not tested",weight:126,started:"10 Sep 2026",completed:"12 Sep 2026",farmer:"Example Karnataka farmer",owner:"Example buyer",origin:"Illustrative farm, Chitradurga, Karnataka",micron:"Not recorded",staple:"Not recorded"};
 let events:{title:string;location:string;notes:string;date:string;logged?:string;actor:string;hash:string;photo:string|null}[]=[];
 let lots:typeof productLots.$inferSelect[]=[];
 let integrity=false;
 if(sample){
  events=[["Shearing started","The farmer creates the source record.","10 Sep 2026"],["Shearing completed","Final wool weight and photo added by the farmer.","12 Sep 2026"],["Buyer offer accepted","The farmer selects an offer.","14 Sep 2026"],["Payment confirmed by seller","Ownership passes to the buyer after manual confirmation.","15 Sep 2026"],["Processing stage recorded","An invited processor links the output to its source batch.","20 Sep 2026"]].map(([title,notes,when])=>({title,notes,date:when,location:"Illustrative Karnataka location",actor:"Example participant",hash:"Illustration only",photo:null}));
 }else{
  const db=getDb();
  const [batch]=await db.select().from(woolBatches).where(eq(woolBatches.id,id)).limit(1);if(!batch)notFound();
  const [farmer]=await db.select({name:users.name}).from(users).where(eq(users.id,batch.farmerId)).limit(1);
  const [owner]=await db.select({name:users.name}).from(users).where(eq(users.id,batch.currentOwnerId)).limit(1);
  const [farm]=batch.farmId?await db.select().from(farms).where(eq(farms.id,batch.farmId)).limit(1):[];
  const stored=await db.select({event:batchEvents,name:users.name}).from(batchEvents).leftJoin(users,eq(users.id,batchEvents.actorId)).where(eq(batchEvents.batchId,id)).orderBy(asc(batchEvents.occurredAt));
  let previousHash:string|null=null;integrity=stored.length>0;
  for(const {event:e} of stored){
   const calculated=e.actorRole?await hashBatchEvent({batchId:e.batchId,eventType:e.eventType,title:e.title,location:e.location,actorId:e.actorId,actorRole:e.actorRole,notes:e.notes,occurredAt:e.occurredAt,previousHash:e.previousHash,evidenceImageHash:e.evidenceImageHash,performedAt:e.performedAt}):null;
   if(!e.eventHash || e.eventHash!==calculated || e.previousHash!==previousHash || (e.evidenceImageData && await hashEvidence(e.evidenceImageData)!==e.evidenceImageHash))integrity=false;
   previousHash=e.eventHash;
  }
  record={breed:batch.breed,grade:batch.grade,weight:batch.weightKg,started:date(batch.shearedAt),completed:batch.completedAt?date(batch.completedAt):"In progress",farmer:farmer?.name??"Source farmer",owner:owner?.name??"Current owner",origin:farm?[farm.name,farm.village,farm.district,farm.state].join(", "):"Not recorded",micron:batch.micron?batch.micron+" μm":"Not recorded",staple:batch.stapleMm?batch.stapleMm+" mm":"Not recorded"};
  events=stored.map(({event:e,name})=>({title:e.title,location:e.location??"",notes:e.notes??"",date:date(e.performedAt??e.occurredAt),logged:e.performedAt?date(e.occurredAt):undefined,actor:(name??"Participant")+" · "+(e.actorRole??"recorded role"),hash:e.eventHash?.slice(0,12)??"Legacy record",photo:e.evidenceImageData}));
  lots=await db.select().from(productLots).where(eq(productLots.batchId,id)).orderBy(asc(productLots.createdAt));
 }
 const qr=await QRCode.toDataURL(appBaseUrl()+"/batch/"+encodeURIComponent(id),{width:220,margin:2});
 return <main className="passport-shell"><header className="passport-nav"><Link href="/"><span className="brand-mark"><Sprout/></span> WoolTrace</Link><Link href="/dashboard"><ArrowLeft/> Workspace</Link></header>
 <section className="passport-hero"><div><p className="kicker light">{sample?"ILLUSTRATIVE EXAMPLE":"PUBLIC WOOL PASSPORT"}</p><h1>{sample?id:"The story of this wool"}</h1><p>{record.breed} · {record.weight} kg · {record.grade}</p><span>{sample?"Not a real farm, sale or laboratory record":integrity?"Recorded event chain matches":"Some records are incomplete or could not be checked"}</span></div><div className="passport-qr"><Image unoptimized width={130} height={130} src={qr} alt="QR linking to this wool passport"/><small>Scan the recorded journey</small></div></section>
 <section className="passport-grid"><article className="passport-main"><div className="passport-heading"><div><p className="kicker">SOURCE FARMER</p><h2>{record.farmer}</h2><p><MapPin/>{record.origin}</p></div></div><div className="passport-facts"><div><small>Breed</small><strong>{record.breed}</strong></div><div><small>Shearing started</small><strong>{record.started}</strong></div><div><small>Shearing completed</small><strong>{record.completed}</strong></div><div><small>Source weight</small><strong>{record.weight} kg</strong></div><div><small>Current owner</small><strong>{record.owner}</strong></div></div><hr/><p className="kicker">PARTICIPANT-RECORDED QUALITY</p><div className="quality-grid"><div><strong>{record.micron}</strong><span>Fibre diameter</span></div><div><strong>{record.staple}</strong><span>Staple length</span></div><div><strong>{record.grade}</strong><span>Assigned grade</span></div></div><p className="wt-notice">A QR reveals the submitted history; it cannot prove the physical wool’s identity or independently verify a farmer’s claims. This is not a government or laboratory certificate.</p><PassportActions batchId={id}/><p className="wt-help">Batch identifier: {id}</p>{lots.length>0&&<><h2>Linked output lots</h2>{lots.map(l=><div className="wt-lot-card" key={l.id}><h3>{l.name}</h3><p>{l.kind.replaceAll("_"," ")} · {l.weightKg} kg</p><Link href={"/lot/"+l.id}>Open product-lot QR →</Link></div>)}</>}</article>
 <aside className="passport-side"><p className="kicker">THE JOURNEY RECORDED SO FAR</p><h2>From the first shearing.</h2>{events.map((e,i)=><div className="passport-event done" key={i}><span>{i+1}</span><p><strong>{e.title}</strong><small>{[e.location,e.notes].filter(Boolean).join("\n")}</small>{e.photo&&<Image unoptimized width={320} height={220} src={e.photo} alt="Farmer-uploaded shearing evidence"/>}<em>{e.actor}<br/>Record: {e.hash}</em></p><time>{e.date}{e.logged&&<small className="wt-event-logged">Added {e.logged}</small>}</time></div>)}</aside></section><footer className="passport-footer"><p>WoolTrace preserves the source farmer while ownership changes. Dates shown in India time. Stage details are supplied by the participants named above.</p></footer></main>;
}
