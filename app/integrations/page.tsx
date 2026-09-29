import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleDot, KeyRound, PlugZap, ShieldCheck } from "lucide-react";
import { getGoogleUser } from "@/app/lib/google-auth";
import { appBaseUrl, integrationDefinitions } from "@/app/lib/integration-config";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const user = await getGoogleUser();
  if (!user && process.env.NODE_ENV === "production") redirect("/login");
  const integrations = integrationDefinitions();
  const ready = integrations.filter((item) => item.state === "live" || item.state === "configured").length;

  return <main className="integration-page">
    <header className="integration-nav"><Link href="/dashboard"><ArrowLeft /> Dashboard</Link><span>WoolTrace / Production setup</span><strong>{ready}/{integrations.length} ready</strong></header>
    <section className="integration-hero">
      <div><p className="kicker">PRODUCTION CONTROL CENTRE</p><h1>Connect the services behind every wool journey.</h1><p>WoolTrace keeps secrets on the server and only displays whether each connection is ready. Never paste credentials into a batch, QR code or browser form.</p></div>
      <aside><ShieldCheck /><strong>Secrets stay private</strong><span>Values are read from deployment environment variables and are never returned to the browser.</span></aside>
    </section>
    <section className="integration-summary"><article><PlugZap /><span><small>READY NOW</small><strong>{ready} connections</strong></span></article><article><KeyRound /><span><small>NEEDS SETUP</small><strong>{integrations.length - ready} connections</strong></span></article><article><CircleDot /><span><small>APPLICATION URL</small><strong>{appBaseUrl().replace("https://", "")}</strong></span></article></section>
    <section className="integration-list">
      <div className="integration-heading"><div><p className="kicker">API & DATA CONNECTIONS</p><h2>Deployment checklist</h2></div><p>Add these names in the Site environment settings. Empty values are treated as disconnected.</p></div>
      {integrations.map((item) => <article key={item.id}>
        <span className={`integration-state ${item.state}`}>{item.state === "live" || item.state === "configured" ? <CheckCircle2 /> : <KeyRound />}</span>
        <div className="integration-copy"><div><h3>{item.label}</h3><b className={item.state}>{item.state === "live" ? "Live" : item.state === "configured" ? "Configured" : "Setup required"}</b></div><p>{item.purpose}</p><small>{item.provider} · {item.detail}</small>{item.note && <code>{item.note}</code>}</div>
        <div className="integration-vars"><small>REQUIRED</small>{item.variables.map((variable) => <code key={variable}>{variable}</code>)}</div>
      </article>)}
    </section>
    <section className="integration-next"><div><p className="kicker">WHAT I STILL NEED FROM YOU</p><h2>Credentials plus two provider choices.</h2></div><ol><li>Create the Google OAuth web client and use the callback URL shown above.</li><li>Choose the exact logistics company/API and wool laboratory/API so their request and webhook formats can be mapped correctly.</li><li>Add Razorpay test credentials first; move to live keys only after end-to-end verification.</li></ol></section>
  </main>;
}
