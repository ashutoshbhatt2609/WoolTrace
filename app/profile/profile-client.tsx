"use client";
import { useRouter } from "next/navigation";
import { Sprout, ArrowRight } from "lucide-react";
import AppShell from "@/app/components/app-shell";
import { ActionForm, Field, requestJson } from "@/app/components/forms";
import type { GoogleUser } from "@/app/lib/google-auth";
import { portalDefinitions, portalRoles } from "@/app/lib/portals";
export default function ProfileClient({user,profile,onboarding=false}:{user:GoogleUser;profile:{role:string;organisation:string|null;upiVpa:string|null;upiName:string|null};onboarding?:boolean}){
 const router=useRouter();
 return <AppShell user={user}><header className="wt-page-head"><div><p className="wt-eyebrow">{onboarding?"WELCOME TO WOOLTRACE":"YOUR ACCOUNT"}</p><h1>{onboarding?"Let’s start your wool story.":"A profile that works for you."}</h1><p>{onboarding?"Choose how you take part. No farm-verification documents required.":"Manage your role, organisation and direct UPI payments."}</p></div><Sprout className="wt-head-icon"/></header>
 <div className="wt-two-columns"><section className="wt-card"><h2>{user.name}</h2><p>{user.email}</p><ActionForm submit={onboarding?"Create my workspace":"Save profile"} onSubmit={async data=>{await requestJson("/api/profile",{method:"PATCH",body:JSON.stringify(Object.fromEntries(data))});if(onboarding)router.push("/dashboard");router.refresh();}}>
 <label>Your role<select name="role" defaultValue={profile.role}>{portalRoles.map(role=><option key={role} value={role}>{portalDefinitions[role].short}</option>)}</select></label>
 <Field name="organisation" label="Farm, group or organisation (optional)" value={profile.organisation??""} required={false}/>
 <p className="wt-help">Roles are self-selected. Labs and partners need a batch-owner invitation before they can add records.</p></ActionForm></section>
 {!onboarding?<section className="wt-card"><h2>Receive payments directly</h2><p>Buyers scan your QR using BHIM or another UPI app. WoolTrace never holds your money.</p><ActionForm submit="Save seller UPI details" onSubmit={async data=>{await requestJson("/api/payments/upi",{method:"PATCH",body:JSON.stringify(Object.fromEntries(data))});}}><Field name="upiVpa" label="Your UPI ID" placeholder="yourname@bank" value={profile.upiVpa??""}/><Field name="upiName" label="Name shown in your UPI app" value={profile.upiName??user.name}/><p className="wt-help">Check your bank account before confirming a payment. A QR scan is not proof of payment.</p></ActionForm></section>:<section className="wt-card wt-soft"><h2>One wool. One connected journey.</h2><ol className="wt-steps"><li>Record where shearing begins.</li><li>Add the date, final weight and photo.</li><li>Connect buyers and invited partners.</li><li>Share the whole story with a QR.</li></ol><p>Source details, photos and stage notes are public on the batch passport. Keep private information out of them.</p><ArrowRight/></section>}</div></AppShell>;
}
