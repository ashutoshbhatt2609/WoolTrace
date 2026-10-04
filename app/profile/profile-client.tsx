"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import AppShell from "@/app/components/app-shell";
import { ActionForm, Field, requestJson } from "@/app/components/forms";
import type { GoogleUser } from "@/app/lib/google-auth";
import { portalDefinitions, portalRoles, isPortalRole } from "@/app/lib/portals";
import { workspaceFor } from "@/app/lib/workspaces";
export default function ProfileClient({user,profile,onboarding=false}:{user:GoogleUser;profile:{role:string;organisation:string|null;upiVpa:string|null;upiName:string|null};onboarding?:boolean}){
 const router=useRouter(),[selected,setSelected]=useState(isPortalRole(profile.role)?profile.role:"farmer");
 const workspace=workspaceFor(selected);
 return <AppShell user={user} role={profile.role}><header className="wt-page-head"><div><p className="wt-eyebrow">{onboarding?"WELCOME TO WOOLTRACE":"YOUR ACCOUNT"}</p><h1>{onboarding?"What’s your part in the journey?":"A workspace that fits your work."}</h1><p>Choose your role. Your navigation, dashboard and everyday tools will adapt to you.</p></div><Sprout className="wt-head-icon"/></header>
 <div className="wt-two-columns wt-wide-left"><section className="wt-card"><h2>{user.name}</h2><p>{user.email}</p><ActionForm submit={onboarding?"Create my workspace":"Save workspace preference"} onSubmit={async data=>{await requestJson("/api/profile",{method:"PATCH",body:JSON.stringify(Object.fromEntries(data))});router.push("/dashboard");router.refresh();}}>
 <fieldset className="wt-role-options"><legend>I work as a…</legend>{portalRoles.map(role=>{const p=portalDefinitions[role],Icon=p.icon;return <label key={role} className={selected===role?"selected":""}><input type="radio" name="role" value={role} checked={selected===role} onChange={()=>setSelected(role)}/><Icon size={20}/><span><strong>{p.short}</strong><small>{p.owns.join(" · ")}</small></span>{selected===role&&<Check size={15}/>}</label>;})}</fieldset>
 <Field name="organisation" label="Farm, group or organisation (optional)" value={profile.organisation??""} required={false}/>
 <p className="wt-help">Roles are self-selected, not verification badges. Switching roles changes your workspace; it does not grant access to other people’s batches. Partner roles still need a batch-owner invitation.</p></ActionForm></section>
 <div><section className="wt-card wt-role-guide"><p className="wt-eyebrow">YOUR WORKSPACE PREVIEW</p><h2>{workspace.title}</h2><p>{workspace.description}</p><ol className="wt-numbered-steps">{workspace.steps.map((step,i)=><li key={step}><span>{i+1}</span><p>{step}</p></li>)}</ol><Link className="wt-text-link" href={"/demo/"+selected}>Try this role before choosing <ArrowRight size={16}/></Link></section>
 {!onboarding&&profile.role==="farmer"&&<section className="wt-card wt-gap"><h2>Receive payments directly</h2><p>Buyers scan your QR using BHIM or another UPI app. WoolTrace never holds your money.</p><ActionForm submit="Save seller UPI details" onSubmit={async data=>{await requestJson("/api/payments/upi",{method:"PATCH",body:JSON.stringify(Object.fromEntries(data))});}}><Field name="upiVpa" label="Your UPI ID" placeholder="yourname@bank" value={profile.upiVpa??""} help="Copy the UPI ID shown in your BHIM or banking app."/><Field name="upiName" label="Recipient name" value={profile.upiName??user.name} help="Use the name buyers see when they pay your UPI ID."/><p className="wt-help">Check your bank account before confirming a payment. A QR scan is not proof of payment.</p></ActionForm></section>}</div></div></AppShell>;
}
