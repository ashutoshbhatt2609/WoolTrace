import Link from "next/link";
import PastureScene from "@/app/components/pasture-scene";
import { ArrowLeft, ArrowUpRight, Sprout } from "lucide-react";
import { portalDefinitions, portalRoles } from "@/app/lib/portals";
import { workspaces } from "@/app/lib/workspaces";

export default function DemoPage(){
 return <main className="wt-demo-picker pastoral-theme"><header><Link className="wt-wordmark" href="/"><span><Sprout/></span>WoolTrace</Link><Link className="wt-text-link" href="/login"><ArrowLeft size={16}/> Back to sign in</Link></header><section className="wt-demo-intro"><span className="wt-pill">NO ACCOUNT NEEDED · SAMPLE DATA ONLY</span><h1>Find your place<br/>in the wool journey.</h1><p>Different work. One connected story. Choose a role and try a short, interactive walkthrough of its everyday tasks.</p></section><section className="wt-demo-grid" aria-label="Choose a demo role">{portalRoles.map(role=>{const p=portalDefinitions[role],w=workspaces[role],Icon=p.icon;return <Link key={role} href={"/demo/"+role} className="wt-demo-role-card"><span className="wt-demo-role-icon"><Icon size={25}/></span><small>{w.subtitle}</small><h2>{p.short}</h2><p>{w.description}</p><span className="wt-demo-role-link">Try {p.short.toLowerCase()} demo <ArrowUpRight size={18}/></span></Link>;})}</section><footer><strong>A safe place to explore.</strong> Demo changes stay in this browser tab. No real listings, payments, invitations or database records are created. Your Google account is not changed.</footer><PastureScene/></main>;
}
