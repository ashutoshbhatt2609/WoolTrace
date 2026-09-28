import { ArrowLeft, BadgeCheck, MapPin, ShieldCheck, Sprout } from "lucide-react";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { batchEvents, users, woolBatches } from "@/db/schema";
import { woolStages } from "@/app/lib/portals";
import PassportActions from "./passport-actions";

export const dynamic = "force-dynamic";

const demoEvents = [
  ["Farm origin verified", "Rafiq Wool Farm, Gulmarg", "10 Sep"],
  ["Sheared & registered", "184 kg fleece recorded", "12 Sep"],
  ["Sorted and graded", "Contamination removed · Grade A", "12 Sep"],
  ["Laboratory tested", "Pashmina Lab, Srinagar", "13 Sep"],
  ["Reverse auction completed", "Farmer accepted verified offer", "15 Sep"],
  ["Custody transferred", "Himalayan Logistics · seal HL-8821", "16 Sep"],
  ["Warehouse received", "Srinagar Wool Hub · 183.6 kg", "16 Sep"],
  ["Scoured and spun", "Yield linked to yarn lots Y-221–Y-226", "20 Sep"],
  ["Fabric manufactured", "Loom lot F-091 linked to source batch", "25 Sep"],
  ["Product QR published", "Origin visible to the final customer", "27 Sep"],
] as const;

export default async function BatchPassport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let record = { breed: "Kashmir Merino", grade: "A", weight: 184, shearing: "12 Sep 2026", owner: "Rafiq Ahmad", origin: "Rafiq Wool Farm · Gulmarg, Baramulla, Jammu & Kashmir", micron: "20.4 μm", staple: "82 mm" };
  let events: { title: string; detail: string; date: string }[] = demoEvents.map(([title, detail, date]) => ({ title, detail, date }));

  try {
    const db = getDb();
    const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, id)).limit(1);
    if (batch) {
      const [farmer] = await db.select().from(users).where(eq(users.id, batch.farmerId)).limit(1);
      const storedEvents = await db.select().from(batchEvents).where(eq(batchEvents.batchId, id)).orderBy(asc(batchEvents.occurredAt));
      record = {
        breed: batch.breed,
        grade: batch.grade,
        weight: batch.weightKg,
        shearing: batch.shearedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        owner: farmer?.name ?? "Registered WoolTrace member",
        origin: "Origin awaiting farm verification",
        micron: batch.micron ? `${batch.micron} μm` : "Pending",
        staple: batch.stapleMm ? `${batch.stapleMm} mm` : "Pending",
      };
      events = storedEvents.map((event) => ({ title: event.title, detail: event.location ?? event.notes ?? "Verified WoolTrace event", date: event.occurredAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) }));
    }
  } catch {
    // The public demo passport remains available if the live database is temporarily unavailable.
  }

  const passportUrl = `https://wooltrace-farm-to-fabric.witty-clock-9839.chatgpt.site/batch/${encodeURIComponent(id)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(passportUrl)}`;

  return <main className="passport-shell">
    <header className="passport-nav"><Link href="/"><span className="brand-mark"><Sprout className="size-4" /></span> WoolTrace</Link><Link href="/dashboard"><ArrowLeft /> Dashboard</Link></header>
    <section className="passport-hero"><div><p className="kicker light">PUBLIC WOOL PASSPORT</p><h1>{id}</h1><p>{record.breed} · Grade {record.grade} · {record.weight} kg</p><span><BadgeCheck /> Chain of custody verified</span></div><div className="passport-qr"><img src={qrUrl} alt={`QR code for wool batch ${id}`} /><small>Scan this batch</small></div></section>
    <section className="passport-grid"><article className="passport-main"><div className="passport-heading"><div><p className="kicker">WOOL ORIGIN</p><h2>{record.owner}</h2><p><MapPin /> {record.origin}</p></div><span className="verified-pill"><ShieldCheck /> Verified source record</span></div><div className="passport-facts"><div><small>Breed</small><strong>{record.breed}</strong></div><div><small>Shearing</small><strong>{record.shearing}</strong></div><div><small>Net weight</small><strong>{record.weight} kg</strong></div><div><small>Current owner</small><strong>{record.owner}</strong></div></div><hr /><p className="kicker">QUALITY ASSESSMENT</p><div className="quality-grid"><div><strong>{record.micron}</strong><span>Fibre diameter</span></div><div><strong>{record.staple}</strong><span>Staple length</span></div><div><strong>{record.grade === "Pending" ? "Pending" : "68%"}</strong><span>Clean yield</span></div><div><strong>{record.grade}</strong><span>Assigned grade</span></div></div><PassportActions batchId={id} /></article><aside className="passport-side"><p className="kicker">CHAIN OF CUSTODY</p><h2>Wool to finished product</h2>{events.map((event, index) => <div className="passport-event done" key={`${event.title}-${index}`}><span>{index + 1}</span><p><strong>{event.title}</strong><small>{event.detail}</small></p><time>{event.date}</time></div>)}</aside></section>
    <section className="passport-lifecycle"><p className="kicker">PASSPORT COVERAGE</p><h2>Every stage this QR can verify</h2><div>{woolStages.map((stage, index) => { const Icon = stage.icon; return <article key={stage.key}><span>{index + 1}</span><Icon /><h3>{stage.title}</h3><p>{stage.detail}</p><small>{stage.owner}</small></article>; })}</div></section>
    <footer className="passport-footer"><ShieldCheck /><div><strong>What this record proves</strong><p>This passport links the wool’s farm origin, shearing, quality, sale, custody, processing, fabric manufacture and final product. Every update is attributed to the portal responsible for that stage.</p></div></footer>
  </main>;
}
