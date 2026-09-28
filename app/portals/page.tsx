import Link from "next/link";
import { ArrowLeft, ArrowRight, QrCode, Sprout } from "lucide-react";
import { redirect } from "next/navigation";
import { getGoogleUser } from "@/app/lib/google-auth";
import { portalDefinitions, portalRoles, woolStages } from "@/app/lib/portals";

export const dynamic = "force-dynamic";

export default async function PortalsPage() {
  const user = await getGoogleUser();
  if (!user && process.env.NODE_ENV === "production") redirect("/login");
  return <main className="portal-hub">
    <header className="portal-topbar"><Link href="/" className="portal-brand"><span className="brand-mark"><Sprout /></span> WoolTrace</Link><Link href="/dashboard"><ArrowLeft /> Farmer dashboard</Link></header>
    <section className="portal-intro"><div><p className="kicker">ONE WOOL RECORD · MULTIPLE PORTALS</p><h1>Every handoff adds proof.<br />The QR keeps it together.</h1><p>Each participant records only the stage they perform. Farmers, buyers and partners share one tamper-evident batch history instead of separate paper trails.</p></div><Link href="/batch/WT-2408-KAS" className="portal-qr-cta"><QrCode /><span><strong>Open a public wool passport</strong><small>See the complete farm-to-product record</small></span><ArrowRight /></Link></section>
    <section className="portal-card-grid" aria-label="WoolTrace portals">{portalRoles.map((role) => { const portal = portalDefinitions[role]; const Icon = portal.icon; return <Link href={`/portal/${role}`} key={role}><span><Icon /></span><small>{portal.owns.join(" · ")}</small><h2>{portal.name}</h2><p>{portal.description}</p><b>Open portal <ArrowRight /></b></Link>; })}</section>
    <section className="lifecycle-section"><div className="lifecycle-heading"><p className="kicker">THE COMPLETE WOOL JOURNEY</p><h2>One batch becomes many products without losing its origin.</h2></div><div className="lifecycle-track">{woolStages.map((stage, index) => { const Icon = stage.icon; return <article key={stage.key}><span>{String(index + 1).padStart(2, "0")}</span><Icon /><div><h3>{stage.title}</h3><p>{stage.detail}</p><small>Recorded by {stage.owner}</small></div></article>; })}</div></section>
  </main>;
}
