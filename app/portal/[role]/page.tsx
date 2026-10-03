import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, QrCode, Sprout } from "lucide-react";
import { getGoogleUser } from "@/app/lib/google-auth";
import { isPortalRole, portalDefinitions, portalRoles, woolStages } from "@/app/lib/portals";
import PortalActions from "./portal-actions";

export const dynamic = "force-dynamic";

export default async function PortalPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!isPortalRole(role)) notFound();
  const user = await getGoogleUser();
  if (!user && process.env.NODE_ENV === "production") redirect("/login");
  const portal = portalDefinitions[role];
  const Icon = portal.icon;
  return <main className="stakeholder-shell">
    <aside className="stakeholder-rail"><Link href="/" className="portal-brand"><span className="brand-mark"><Sprout /></span> WoolTrace</Link><p>PORTALS</p><nav>{portalRoles.map((item) => { const ItemIcon = portalDefinitions[item].icon; return <Link className={item === role ? "active" : ""} href={`/portal/${item}`} key={item}><ItemIcon /> {portalDefinitions[item].short}</Link>; })}</nav><Link className="all-portals" href="/portals"><ArrowLeft /> All portals</Link></aside>
    <section className="stakeholder-main"><header><div><p className="kicker">WOOLTRACE WORKSPACE</p><h1>{portal.name}</h1></div><div className="portal-user"><span>{(user?.name ?? "Demo user")[0]}</span><div><strong>{user?.name ?? "Demo user"}</strong><small>Verified workspace</small></div></div></header>
      <section className="stakeholder-hero"><span><Icon /></span><div><h2>{portal.description}</h2><p>Your updates become part of the same QR passport used by each participant and the final customer.</p></div><Link className="portal-scan-button" href="/batch/WT-2610-KAR"><QrCode /> View sample QR</Link></section>
      <section className="portal-work-grid"><PortalActions role={role} actions={portal.actions} />
      <article className="portal-batch-panel"><div className="panel-head"><div><p className="kicker">SAMPLE BATCH</p><h3>WT-2610-KAR</h3></div><Link href="/batch/WT-2610-KAR"><QrCode /></Link></div><div className="portal-batch-facts"><div><small>Breed</small><strong>Deccani</strong></div><div><small>Weight</small><strong>126 kg</strong></div><div><small>Grade</small><strong>B</strong></div><div><small>Origin</small><strong>Chitradurga</strong></div></div><Link href="/batch/WT-2610-KAR">Open complete passport <ArrowRight /></Link></article></section>
      <section className="portal-chain"><div className="panel-head"><div><p className="kicker">SHARED CHAIN OF CUSTODY</p><h3>What happens before and after your stage</h3></div></div><div>{woolStages.map((stage, index) => <article className={index < 4 ? "complete" : index === 4 ? "current" : ""} key={stage.key}><span>{index < 4 ? <CheckCircle2 /> : index + 1}</span><h4>{stage.title}</h4><small>{stage.owner}</small></article>)}</div></section>
    </section>
  </main>;
}
