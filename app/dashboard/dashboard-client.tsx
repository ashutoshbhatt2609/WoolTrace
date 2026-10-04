"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, HandCoins, RefreshCw, Check, ArrowUpRight } from "lucide-react";
import AppShell from "@/app/components/app-shell";
import { requestJson } from "@/app/components/forms";
import type { GoogleUser } from "@/app/lib/google-auth";
import { workspaceFor } from "@/app/lib/workspaces";
import { portalDefinitions, isPortalRole } from "@/app/lib/portals";

type Batch={id:string;breed:string;weight:number;status:string;saleStatus:string;bids:number};
export default function DashboardClient({user,role}:{user:GoogleUser;role:string}){
 const workspace=workspaceFor(role), portal=portalDefinitions[isPortalRole(role)?role:"farmer"], Icon=portal.icon;
 const [batches,setBatches]=useState<Batch[]>([]),[offerCount,setOfferCount]=useState(0),[summary,setSummary]=useState({batches:0,totalWeightKg:0}),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const fetchData=useCallback(async()=>{
  const data=await requestJson<{batches:Batch[];summary:{batches:number;totalWeightKg:number}}>("/api/batches");
  const bids=["farmer","buyer"].includes(role)?await requestJson<{bids:{status:string}[];summary:{openOffers:number}}>("/api/bids"):null;
  return {batches:data.batches,summary:data.summary,offers:bids?.summary.openOffers??0};
 },[role]);
 async function load(){setLoading(true);try{const data=await fetchData();setBatches(data.batches);setSummary(data.summary);setOfferCount(data.offers);setError("");}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
 useEffect(()=>{let active=true;fetchData().then(data=>{if(active){setBatches(data.batches);setSummary(data.summary);setOfferCount(data.offers);setError("");}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[fetchData]);
 const commerce=role==="farmer"||role==="buyer";
 const metrics=[{label:workspace.batchLabel,value:summary.batches,icon:Package},{label:"Connected wool",value:summary.totalWeightKg.toLocaleString()+" kg",icon:Icon},{label:commerce?(role==="farmer"?"Offers to follow up":"My open offers"):"Stages you record",value:commerce?offerCount:portal.owns.length,icon:commerce?HandCoins:Check}];
 return <AppShell user={user} role={role}>
  <div className="wt-workspace-top"><span>Workspace <span aria-hidden="true">/</span> {portal.short}</span><span className="wt-live-label"><i/> Your account records</span></div>
  <header className="wt-page-head wt-overview-head"><div><p className="wt-eyebrow">{workspace.subtitle}</p><h1>Hello, {user.name.split(" ")[0]}<span className="wt-greeting-dot">.</span></h1><p>A place for your part of the wool journey.</p></div><Link className="wt-outline" href={"/portal/"+role}>My stage workspace <ArrowUpRight size={17}/></Link></header>
  <section className="wt-role-hero"><div><span className="wt-pill">{workspace.title}</span><h2>{workspace.headline}</h2><p>{workspace.description}</p><Link className="wt-button" href={workspace.primary[1]}>{workspace.primary[0]} <ArrowRight size={17}/></Link></div><div className="wt-role-illustration" aria-hidden="true"><div><Icon size={72} strokeWidth={1}/></div><span>ONE ORIGIN. A SHARED JOURNEY.</span></div></section>
  {error&&<div className="wt-error" role="alert">{error} <button onClick={load}>Retry</button></div>}
  <section className="wt-metrics" aria-busy={loading} aria-label="Workspace summary">{metrics.map(({label,value,icon:I})=><article key={label}><I size={22}/><small>{label}</small><strong>{loading||error?"—":value}</strong><span className="wt-metric-note">{label==="Stages you record"?"For your role":"From connected records"}</span></article>)}</section>
  <div className="wt-two-columns wt-wide-left"><section className="wt-card"><div className="wt-section-title"><div><p className="wt-eyebrow">CONNECTED TO YOU</p><h2>{workspace.batchLabel}</h2></div><button className="wt-icon-button" aria-label="Refresh batches" disabled={loading} onClick={load}><RefreshCw size={18}/></button></div>
   {loading?<p role="status">Loading your records…</p>:error?<p>Records could not be loaded. Retry above.</p>:batches.length?batches.slice(0,5).map(b=><Link className="wt-batch-row" href={"/batch/"+b.id} key={b.id}><span className="wt-batch-icon"><Package/></span><div><strong>{b.breed} wool</strong><small>{b.id.slice(0,18)}… · {b.weight} kg</small></div><span className="wt-pill">{b.status.replaceAll("_"," ")}</span><ArrowRight size={17}/></Link>):<div className="wt-empty"><Icon size={38}/><h3>{role==="farmer"?"Your first wool record starts here":role==="buyer"?"Your next purchase has a story":"Ready for your first assignment"}</h3><p>{role==="farmer"?"Add the farm source and begin a shearing record.":role==="buyer"?"Browse farmer listings. Your wool appears here once the seller confirms payment.":"Ask the batch owner to invite your Google email. Assigned records will appear here."}</p><Link href={workspace.primary[1]} className="wt-button">{workspace.primary[0]} <ArrowRight size={16}/></Link></div>}
   {!!batches.length&&<Link className="wt-text-link" href={commerce?"/workspace/my-wool":"/portal/"+role}>Open {commerce?"batch management":"assigned batches"} <ArrowRight size={16}/></Link>}
  </section><section className="wt-card wt-role-guide"><p className="wt-eyebrow">YOUR WORKFLOW</p><h2>A clear next step.</h2><ol className="wt-numbered-steps">{workspace.steps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol><Link className="wt-text-link" href="/workspace/traceability">Read a wool passport <ArrowRight size={16}/></Link></section></div>
  <section className="wt-demo-invite"><div><strong>Get comfortable before you begin.</strong><p>Try the {portal.short.toLowerCase()} workflow with sample records. Your real data stays untouched.</p></div><Link href={"/demo/"+role} className="wt-outline">Try this portal’s demo <ArrowRight size={17}/></Link></section>
 </AppShell>;
}
