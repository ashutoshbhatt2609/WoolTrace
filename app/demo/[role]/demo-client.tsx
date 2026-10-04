"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, RotateCcw, QrCode, Package, FlaskConical } from "lucide-react";
import AppShell from "@/app/components/app-shell";
import { ActionForm, Field } from "@/app/components/forms";
import { type PortalRole, portalDefinitions } from "@/app/lib/portals";
import { workspaces } from "@/app/lib/workspaces";

type DemoEvent={title:string;detail:string;at:string};
type DemoState={version:1;step:number;events:DemoEvent[]};
const initial:DemoState={version:1,step:0,events:[]};
export default function DemoClient({role}:{role:PortalRole}){
 const w=workspaces[role],p=portalDefinitions[role],Icon=p.icon,key="wooltrace-demo-v1:"+role;
 const [state,setState]=useState<DemoState>(initial),[ready,setReady]=useState(false),[notice,setNotice]=useState(""),[qr,setQr]=useState("");
 useEffect(()=>{
  let saved=initial,warning="";
  try{const raw=sessionStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(parsed.version===1&&Number.isInteger(parsed.step)&&parsed.step>=0&&parsed.step<=w.demoActions.length&&Array.isArray(parsed.events)&&parsed.events.length===parsed.step&&parsed.events.every((e:DemoEvent)=>typeof e.title==="string"&&typeof e.detail==="string"&&typeof e.at==="string"))saved=parsed;}}
  catch{warning="Browser storage is unavailable. You can still try the demo, but a refresh may reset it.";}
  // Defer initialization until after hydration; sample data never comes from the real API.
  const timer=setTimeout(()=>{setState(saved);setNotice(warning);setReady(true);},0);
  return()=>clearTimeout(timer);
 },[key,w.demoActions.length]);
 function update(next:DemoState){setState(next);try{sessionStorage.setItem(key,JSON.stringify(next));}catch{setNotice("Changes are available for this visit but could not be saved in browser storage.");}}
 async function submit(data:FormData){
  if(!ready||state.step>=w.demoActions.length)return;
  const location=String(data.get("location")??"").trim();if(location.length<2)throw new Error("Add a sample location with at least two characters.");
  const parts=[location];
  for(const [label,name] of [["Weight (kg)","weight"],["Offer (₹/kg)","price"],["Micron","micron"],["Staple (mm)","staple"],["Sample lot","lotName"]]){const value=data.get(name);if(value)parts.push(label+": "+String(value));}
  const notes=String(data.get("notes")??"").trim();if(notes)parts.push(notes);
  update({version:1,step:state.step+1,events:[...state.events,{title:w.demoActions[state.step],detail:parts.join(" · "),at:new Date().toISOString()}]});
 }
 async function showQR(){try{const QR=await import("qrcode");setQr(await QR.toDataURL(window.location.origin+"/batch/WT-2610-KAR",{width:220,margin:2}));}catch{setNotice("QR preview could not load. Open the example passport using the link below.");}}
 const done=state.step>=w.demoActions.length;
 return <AppShell user={{sub:"browser-demo-"+role,email:role+"@example.test",name:"Demo "+p.short}} role={role} demo>
  <div className="wt-demo-banner"><FlaskConical size={19}/><p><strong>Demo mode</strong> Sample activity only. Nothing here changes real wool records or moves money.</p><Link href="/demo">Change role <ArrowRight size={15}/></Link></div>
  <header className="wt-page-head"><div><p className="wt-eyebrow">{w.subtitle}</p><h1>{w.title}</h1><p>{w.description}</p></div><button className="wt-outline" disabled={!ready} onClick={()=>{if(window.confirm("Reset this role’s sample activity in this tab?")){update(initial);setQr("");}}}><RotateCcw size={16}/> Reset demo</button></header>
  {notice&&<p className="wt-notice" role="status">{notice}</p>}
  <section className="wt-metrics"><article><Icon size={22}/><small>Active demo role</small><strong className="wt-demo-role-value">{p.short}</strong><span className="wt-metric-note">Independent role walkthrough</span></article><article><Check size={22}/><small>Steps completed</small><strong>{ready?state.step+" / "+w.demoActions.length:"—"}</strong><span className="wt-metric-note">Saved in this tab only</span></article><article><Package size={22}/><small>Illustrative source batch</small><strong>120 kg</strong><span className="wt-metric-note">Deccani wool · sample weight</span></article></section>
  <div className="wt-two-columns wt-wide-left"><section className="wt-card" id="demo-task"><p className="wt-eyebrow">TRY YOUR WORKFLOW</p><div className="wt-demo-progress" aria-label={"Step "+Math.min(state.step+1,w.demoActions.length)+" of "+w.demoActions.length}>{w.demoActions.map((action,i)=><span key={action} className={i<state.step?"complete":i===state.step?"current":""} title={action}/>)}</div>
   {!ready?<p role="status">Preparing your demo…</p>:done?<div className="wt-demo-complete"><Check size={36}/><h2>You’ve tried the {p.short.toLowerCase()} workflow.</h2><p>These were local sample actions, not real transactions. Sign in with Google to create your own workspace, or explore another role.</p><Link className="wt-button" href="/login">Use my Google account <ArrowRight size={17}/></Link><Link className="wt-text-link" href="/demo">Explore another role →</Link></div>:<><h2>{w.demoActions[state.step]}</h2><p>{role==="buyer"&&state.step===2?"Simulate the seller’s response for this walkthrough. In the real app, only the seller can accept an offer.":"Enter example details below to add this step to your local demo history."}</p><ActionForm key={role+state.step} submit={w.demoActions[state.step]} success="Sample step recorded." onSubmit={submit}>
   <div className="wt-fields"><Field name="location" label="Sample location" value="Chitradurga, Karnataka"/>{role==="farmer"&&state.step<2&&<Field name="weight" label="Sample wool weight (kg)" type="number" value={120} min=".01" max="100000" step=".01"/>}{role==="buyer"&&state.step===1&&<Field name="price" label="Sample offer (₹/kg)" type="number" value={95} min="90" max="1000000" step=".01"/>}{role==="laboratory"&&state.step===1&&<><Field name="micron" label="Sample fibre diameter (micron)" type="number" value={32} min=".01" max="100" step=".01"/><Field name="staple" label="Sample staple length (mm)" type="number" value={54} min=".01" max="500" step=".01"/></>}{["processor","brand"].includes(role)&&state.step===w.demoActions.length-1&&<><Field name="lotName" label="Sample output lot name" value={role==="processor"?"Deccani yarn lot":"Wool throw collection"}/><Field name="weight" label="Sample output weight (kg)" type="number" value={80} min=".01" max="120" step=".01"/></>}</div><Field name="notes" label="Sample notes (optional)" required={false} placeholder="Add a note for this walkthrough"/><p className="wt-help">Do not enter personal information. This is a simplified demonstration; real actions require your own account and batch permissions.</p></ActionForm></>}
  </section><section className="wt-card wt-role-guide"><p className="wt-eyebrow">THE WOOL YOU’RE WORKING WITH</p><h2>Deccani wool</h2><dl className="wt-demo-facts"><div><dt>Source</dt><dd>Illustrative Karnataka farm</dd></div><div><dt>Batch</dt><dd>DEMO-DECCANI-01</dd></div><div><dt>Reference reserve</dt><dd>₹90 / kg · sample price</dd></div><div><dt>Your part</dt><dd>{p.owns.join(" · ")}</dd></div></dl><button className="wt-outline" onClick={showQR}><QrCode size={17}/> Preview an example QR</button>{qr&&<Image className="wt-demo-qr" unoptimized src={qr} width={220} height={220} alt="QR linking to the illustrative public wool passport"/>}<Link className="wt-text-link" href="/batch/WT-2610-KAR" target="_blank" rel="noreferrer">Open example passport ↗</Link><p className="wt-help">The QR opens a separate, fixed example passport. Your demo changes are local and are not published on it.</p></section></div>
  <section className="wt-card wt-gap"><div className="wt-section-title"><div><p className="wt-eyebrow">THIS TAB’S SAMPLE HISTORY</p><h2>Your walkthrough, step by step.</h2></div><span className="wt-pill">NOT A REAL BATCH RECORD</span></div>{!state.events.length?<p>Complete your first sample action to start the timeline.</p>:<ol className="wt-demo-history">{state.events.map((event,i)=><li key={i}><span><Check size={15}/></span><div><strong>{event.title}</strong><p>{event.detail}</p><time dateTime={event.at}>{new Date(event.at).toLocaleString("en-IN")}</time></div></li>)}</ol>}</section>
 </AppShell>;
}
