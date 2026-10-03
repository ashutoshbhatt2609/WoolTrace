import { ArrowLeft, BadgeCheck, MapPin, ShieldCheck, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getDb } from "@/db";
import { batchEvents, farms, users, woolBatches } from "@/db/schema";
import { woolStages } from "@/app/lib/portals";
import { hashBatchEvent } from "@/app/lib/event-integrity";
import { appBaseUrl } from "@/app/lib/integration-config";
import PassportActions from "./passport-actions";

export const dynamic = "force-dynamic";

const demoEvents = [
  ["Farm origin recorded", "Chitradurga Shepherd Group, Karnataka", "10 Sep"],
  ["Shearing completed", "126 kg fleece and farmer photo recorded", "12 Sep"],
  ["Sorted and graded", "Contamination removed · Grade A", "12 Sep"],
  ["Laboratory result added", "Textiles Committee Regional Laboratory, Bengaluru", "13 Sep"],
  ["Reverse auction completed", "Farmer accepted the selected offer", "15 Sep"],
  ["Custody transferred", "Karnataka Rural Logistics · seal KR-8821", "16 Sep"],
  ["Warehouse received", "Srinagar Wool Hub · 183.6 kg", "16 Sep"],
  ["Scoured and spun", "Yield linked to yarn lots Y-221–Y-226", "20 Sep"],
  ["Fabric manufactured", "Loom lot F-091 linked to source batch", "25 Sep"],
  ["Product QR published", "Origin visible to the final customer", "27 Sep"],
] as const;

export default async function BatchPassport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isSample = id === "WT-2610-KAR";
  let record: { breed: string; grade: string; weight: number; shearing: string; owner: string; origin: string; micron: string; staple: string } | null = isSample ? { breed: "Deccani", grade: "B", weight: 126, shearing: "12 Sep 2026", owner: "Manjunath Gowda", origin: "Chitradurga Shepherd Group · Chitradurga, Karnataka", micron: "32.8 μm", staple: "54 mm" } : null;
  let events: { title: string; detail: string; date: string; actorRole: string; hash: string; verified: boolean; evidenceImageData?: string | null }[] = isSample ? demoEvents.map(([title, detail, date], index) => ({ title, detail, date, actorRole: woolStages[Math.min(index, woolStages.length - 1)].owner, hash: `DEMO${String(index + 1).padStart(4, "0")}`, verified: true })) : [];
  let integrityComplete = isSample;

  try {
    const db = getDb();
    const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, id)).limit(1);
    if (batch) {
      const [owner] = await db.select().from(users).where(eq(users.id, batch.currentOwnerId)).limit(1);
      const [farm] = batch.farmId ? await db.select().from(farms).where(eq(farms.id, batch.farmId)).limit(1) : [];
      const storedEvents = await db.select().from(batchEvents).where(eq(batchEvents.batchId, id)).orderBy(asc(batchEvents.occurredAt));
      let previousHash: string | null = null;
      integrityComplete = storedEvents.length > 0;
      for (const event of storedEvents) {
        if (!event.eventHash || !event.verified || !event.actorRole || event.previousHash !== previousHash) { integrityComplete = false; break; }
        const calculated = await hashBatchEvent({ batchId: event.batchId, eventType: event.eventType, title: event.title, location: event.location, actorId: event.actorId, actorRole: event.actorRole, notes: event.notes, occurredAt: event.occurredAt, previousHash: event.previousHash, evidenceImageHash: event.evidenceImageHash });
        if (calculated !== event.eventHash) { integrityComplete = false; break; }
        previousHash = event.eventHash;
      }
      record = {
        breed: batch.breed,
        grade: batch.grade,
        weight: batch.weightKg,
        shearing: batch.shearedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        owner: owner?.name ?? "Registered WoolTrace member",
        origin: farm ? `${farm.name} · ${farm.village}, ${farm.district}, ${farm.state}` : "Origin source not yet linked",
        micron: batch.micron ? `${batch.micron} μm` : "Pending",
        staple: batch.stapleMm ? `${batch.stapleMm} mm` : "Pending",
      };
      events = storedEvents.map((event) => ({ title: event.title, detail: event.location ?? event.notes ?? "Recorded WoolTrace event", date: event.occurredAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), actorRole: event.actorRole ?? "Recorded member", hash: event.eventHash?.slice(0, 12).toUpperCase() ?? "Legacy", verified: event.verified && Boolean(event.eventHash), evidenceImageData: event.evidenceImageData }));
    }
  } catch {
    // Only the named sample passport remains available if the database is unavailable.
  }

  if (!record) notFound();

  const passportUrl = `${appBaseUrl()}/batch/${encodeURIComponent(id)}`;
  const qrUrl = await QRCode.toDataURL(passportUrl, { width: 220, margin: 2, errorCorrectionLevel: "M", color: { dark: "#102b20", light: "#ffffff" } });

  return <main className="passport-shell">
    <header className="passport-nav"><Link href="/"><span className="brand-mark"><Sprout className="size-4" /></span> WoolTrace</Link><Link href="/dashboard"><ArrowLeft /> Dashboard</Link></header>
    <section className="passport-hero"><div><p className="kicker light">PUBLIC WOOL PASSPORT</p><h1>{id}</h1><p>{record.breed} · Grade {record.grade} · {record.weight} kg</p><span><BadgeCheck /> {integrityComplete ? "Hash-linked wool history" : "Traceability record in progress"}</span></div><div className="passport-qr"><Image unoptimized width={108} height={108} src={qrUrl} alt={`QR code for wool batch ${id}`} /><small>Scan this wool</small></div></section>
    <section className="passport-grid"><article className="passport-main"><div className="passport-heading"><div><p className="kicker">WOOL ORIGIN</p><h2>{record.owner}</h2><p><MapPin /> {record.origin}</p></div><span className="verified-pill declared"><ShieldCheck /> Farmer-recorded source</span></div><div className="passport-facts"><div><small>Breed</small><strong>{record.breed}</strong></div><div><small>Shearing</small><strong>{record.shearing}</strong></div><div><small>Source weight</small><strong>{record.weight} kg</strong></div><div><small>Current owner</small><strong>{record.owner}</strong></div></div><hr /><p className="kicker">QUALITY ASSESSMENT</p><div className="quality-grid"><div><strong>{record.micron}</strong><span>Fibre diameter</span></div><div><strong>{record.staple}</strong><span>Staple length</span></div><div><strong>{record.grade === "Pending" ? "Pending" : "Recorded"}</strong><span>Test status</span></div><div><strong>{record.grade}</strong><span>Assigned grade</span></div></div><PassportActions batchId={id} /></article><aside className="passport-side"><p className="kicker">WOOL JOURNEY</p><h2>Farm to finished product</h2>{events.map((event, index) => <div className={`passport-event ${event.verified ? "done" : ""}`} key={`${event.title}-${index}`}><span>{index + 1}</span><p><strong>{event.title}</strong><small>{event.detail}</small>{event.evidenceImageData && <Image unoptimized className="event-evidence-photo" width={320} height={220} src={event.evidenceImageData} alt={`Farmer evidence for ${event.title}`} />}<em>{event.actorRole} · {event.hash}</em></p><time>{event.date}</time></div>)}</aside></section>
    <section className="passport-lifecycle"><p className="kicker">PASSPORT COVERAGE</p><h2>Every stage this QR can verify</h2><div>{woolStages.map((stage, index) => { const Icon = stage.icon; return <article key={stage.key}><span>{index + 1}</span><Icon /><h3>{stage.title}</h3><p>{stage.detail}</p><small>{stage.owner}</small></article>; })}</div></section>
    <footer className="passport-footer"><ShieldCheck /><div><strong>The wool history recorded so far</strong><p>This QR shows farmer-entered source details and every later handoff added by participants. It is a traceability record, not a government or laboratory certificate.</p></div></footer>
  </main>;
}
