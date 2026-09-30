import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleDot, KeyRound, PlugZap, ShieldCheck } from "lucide-react";
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
    <section className="credential-guide">
      <div className="integration-heading"><div><p className="kicker">WHERE TO GET EVERYTHING</p><h2>Four simple setup steps</h2></div><p>Create accounts in your own name or organisation. Add the resulting values to the Site environment—never send secret values through chat.</p></div>
      <div>
        <article><span>1 · REQUIRED FIRST</span><h3>Google login</h3><p>Open Google Cloud, create an OAuth client for a web application, and copy its Client ID and Client Secret.</p><a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">Open Google Cloud <ArrowUpRight /></a><small>Use this redirect: {appBaseUrl()}/api/auth/google/callback</small></article>
        <article><span>2 · MARKET DATA</span><h3>Government mandi prices</h3><p>Create a free data.gov.in account, generate an API key, then select the AGMARKNET resource whose commodity and market coverage you want.</p><a href="https://www.data.gov.in/" target="_blank" rel="noreferrer">Open data.gov.in <ArrowUpRight /></a><small>You need both the API key and Resource ID.</small></article>
        <article><span>READY · NO API KEY</span><h3>BHIM / UPI payments</h3><p>Each seller saves their own UPI ID in Reverse bidding. An accepted offer creates a BHIM-compatible QR with the exact batch value.</p><strong>No gateway account is required.</strong><small>The seller confirms receipt in their bank or UPI app before releasing wool.</small></article>
        <article><span>3 · MAPS</span><h3>Google Maps</h3><p>Enable only the Maps services you need, create a separate API key, and restrict it to the WoolTrace domain and selected APIs.</p><a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noreferrer">Open Maps credentials <ArrowUpRight /></a><small>A restricted key reduces misuse and unexpected charges.</small></article>
        <article><span>4 · CHOOSE PROVIDERS</span><h3>Transport and wool laboratory</h3><p>Ask your logistics company and wool-testing laboratory whether they have a REST API, sandbox account and signed webhooks.</p><strong>Send their API documentation—not the secret keys.</strong><small>I need the request format, response example, authentication method and webhook rules.</small></article>
        <article><span>OPTIONAL · FILE UPLOADS</span><h3>Certificates and delivery photos</h3><p>The database already stores structured records. Signed PDFs and photographs need an R2 file-storage binding called FILES.</p><strong>Tell me which files and how long to retain them.</strong><small>No extra database URL is needed.</small></article>
      </div>
    </section>
    <section className="integration-next"><div><p className="kicker">WHAT I STILL NEED FROM YOU</p><h2>Credentials plus two provider choices.</h2></div><ol><li>Create the Google OAuth web client and use the callback URL shown above.</li><li>Choose the exact logistics company/API and wool laboratory/API so their request and webhook formats can be mapped correctly.</li><li>Each farmer or seller adds their own UPI ID inside Reverse bidding—no payment secret is needed from you.</li></ol></section>
  </main>;
}
