import { ArrowLeft, BadgeCheck, MapPin, ShieldCheck, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getDb } from "@/db";
import { batchCertificates, batchEvents, farms, users, woolBatches } from "@/db/schema";
import { woolStages } from "@/app/lib/portals";
import { hashBatchEvent } from "@/app/lib/event-integrity";
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
  const isSample = id === "WT-2408-KAS";
  let record: { breed: string; grade: string; weight: number; shearing: string; owner: string; origin: string; micron: string; staple: string; farmVerified: boolean } | null = isSample ? { breed: "Kashmir Merino", grade: "A", weight: 184, shearing: "12 Sep 2026", owner: "Rafiq Ahmad", origin: "Rafiq Wool Farm · Gulmarg, Baramulla, Jammu & Kashmir", micron: "20.4 μm", staple: "82 mm", farmVerified: true } : null;
  let events: { title: string; detail: string; date: string; actorRole: string; hash: string; verified: boolean }[] = isSample ? demoEvents.map(([title, detail, date], index) => ({ title, detail, date, actorRole: woolStages[Math.min(index, woolStages.length - 1)].owner, hash: `DEMO${String(index + 1).padStart(4, "0")}`, verified: true })) : [];
  let certificate: { serial: string; productName: string; productRef: string; issuedAt: Date; snapshotHash: string; status: string } | null = isSample ? { serial: "WTC-2026-SAMPLE", productName: "Kashmir Merino provenance sample", productRef: "DEMO-PRODUCT-01", issuedAt: new Date("2026-09-27T10:00:00Z"), snapshotHash: "sample-certificate-hash", status: "sample" } : null;
  let integrityComplete = isSample;

  try {
    const db = getDb();
    const [batch] = await db.select().from(woolBatches).where(eq(woolBatches.id, id)).limit(1);
    if (batch) {
      const [owner] = await db.select().from(users).where(eq(users.id, batch.currentOwnerId)).limit(1);
      const [farm] = batch.farmId ? await db.select().from(farms).where(eq(farms.id, batch.farmId)).limit(1) : [];
      const [storedCertificate] = await db.select().from(batchCertificates).where(eq(batchCertificates.batchId, id)).limit(1);
      const storedEvents = await db.select().from(batchEvents).where(eq(batchEvents.batchId, id)).orderBy(asc(batchEvents.occurredAt));
      let previousHash: string | null = null;
      integrityComplete = storedEvents.length > 0;
      for (const event of storedEvents) {
        if (!event.eventHash || !event.verified || !event.actorRole || event.previousHash !== previousHash) { integrityComplete = false; break; }
        const calculated = await hashBatchEvent({ batchId: event.batchId, eventType: event.eventType, title: event.title, location: event.location, actorId: event.actorId, actorRole: event.actorRole, notes: event.notes, occurredAt: event.occurredAt, previousHash: event.previousHash });
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
        farmVerified: farm?.verified ?? false,
      };
      events = storedEvents.map((event) => ({ title: event.title, detail: event.location ?? event.notes ?? "Recorded WoolTrace event", date: event.occurredAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), actorRole: event.actorRole ?? "Legacy record", hash: event.eventHash?.slice(0, 12).toUpperCase() ?? "Legacy", verified: event.verified && Boolean(event.eventHash) }));
      certificate = storedCertificate ?? null;
    }
  } catch {
    // Only the named sample passport remains available if the database is unavailable.
  }

  if (!record) notFound();

  const passportUrl = `https://wooltrace-farm-to-fabric.witty-clock-9839.chatgpt.site/batch/${encodeURIComponent(id)}`;
  const qrUrl = await QRCode.toDataURL(passportUrl, { width: 220, margin: 2, errorCorrectionLevel: "M", color: { dark: "#102b20", light: "#ffffff" } });

  return <main className="passport-shell">
    <header className="passport-nav"><Link href="/"><span className="brand-mark"><Sprout className="size-4" /></span> WoolTrace</Link><Link href="/dashboard"><ArrowLeft /> Dashboard</Link></header>
    <section className="passport-hero"><div><p className="kicker light">PUBLIC WOOL PASSPORT</p><h1>{id}</h1><p>{record.breed} · Grade {record.grade} · {record.weight} kg</p><span><BadgeCheck /> {certificate ? "Final traceability certificate issued" : integrityComplete ? "Hash-linked journey in progress" : "Traceability record in progress"}</span></div><div className="passport-qr"><Image unoptimized width={108} height={108} src={qrUrl} alt={`QR code for wool batch ${id}`} /><small>{certificate ? "Certified product QR" : "Scan this batch"}</small></div></section>
    <section className="passport-grid"><article className="passport-main"><div className="passport-heading"><div><p className="kicker">WOOL ORIGIN</p><h2>{record.owner}</h2><p><MapPin /> {record.origin}</p></div><span className={`verified-pill ${record.farmVerified ? "" : "declared"}`}><ShieldCheck /> {record.farmVerified ? "Verified farm source" : "Farmer-declared source"}</span></div><div className="passport-facts"><div><small>Breed</small><strong>{record.breed}</strong></div><div><small>Shearing</small><strong>{record.shearing}</strong></div><div><small>Source weight</small><strong>{record.weight} kg</strong></div><div><small>Current owner</small><strong>{record.owner}</strong></div></div><hr /><p className="kicker">QUALITY ASSESSMENT</p><div className="quality-grid"><div><strong>{record.micron}</strong><span>Fibre diameter</span></div><div><strong>{record.staple}</strong><span>Staple length</span></div><div><strong>{record.grade === "Pending" ? "Pending" : "Recorded"}</strong><span>Test status</span></div><div><strong>{record.grade}</strong><span>Assigned grade</span></div></div>{certificate && <section className="certificate-proof"><BadgeCheck /><div><p className="kicker">WOOLTRACE DIGITAL CERTIFICATE</p><h3>{certificate.productName}</h3><span>Serial {certificate.serial} · Product {certificate.productRef}</span><small>Issued {certificate.issuedAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · Snapshot {certificate.snapshotHash.slice(0, 16).toUpperCase()}</small></div></section>}<PassportActions batchId={id} /></article><aside className="passport-side"><p className="kicker">CHAIN OF CUSTODY</p><h2>Wool to finished product</h2>{events.map((event, index) => <div className={`passport-event ${event.verified ? "done" : ""}`} key={`${event.title}-${index}`}><span>{index + 1}</span><p><strong>{event.title}</strong><small>{event.detail}</small><em>{event.actorRole} · {event.hash}</em></p><time>{event.date}</time></div>)}</aside></section>
    <section className="passport-lifecycle"><p className="kicker">PASSPORT COVERAGE</p><h2>Every stage this QR can verify</h2><div>{woolStages.map((stage, index) => { const Icon = stage.icon; return <article key={stage.key}><span>{index + 1}</span><Icon /><h3>{stage.title}</h3><p>{stage.detail}</p><small>{stage.owner}</small></article>; })}</div></section>
    <footer className="passport-footer"><ShieldCheck /><div><strong>{certificate ? "Certified lifetime record" : "Traceability evidence collected so far"}</strong><p>{certificate ? "This WoolTrace digital certificate freezes the hash-linked farm, shearing, quality, sale, custody, processing and finished-product evidence behind this QR." : "This passport shows only the stages actually recorded. It will not display a final certificate until every required stage is signed and hash-linked."}</p></div></footer>
  </main>;
}
