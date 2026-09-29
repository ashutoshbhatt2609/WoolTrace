"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, BadgeCheck, BarChart3, Boxes, CheckCircle2, ClipboardCheck,
  HandCoins, LayoutDashboard, PackagePlus, PlugZap, QrCode, Search, Sprout, Store,
  Truck, Warehouse,
} from "lucide-react";
import type { GoogleUser } from "@/app/lib/google-auth";

export const workspaceModules = ["my-wool", "woolkart", "reverse-bidding", "traceability", "quality", "transport", "warehouses", "services", "market-prices"] as const;
export type WorkspaceModule = typeof workspaceModules[number];

const moduleInfo: Record<WorkspaceModule, { label: string; title: string; text: string; icon: typeof Boxes }> = {
  "my-wool": { label: "My wool", title: "Register and manage wool batches", text: "Create the batch passport at shearing and open every saved record.", icon: Boxes },
  woolkart: { label: "WoolKart", title: "Browse live wool listings", text: "Open verified passports and place transparent buyer offers.", icon: Store },
  "reverse-bidding": { label: "Reverse bidding", title: "Compare offers on equal terms", text: "Review price, pickup time and payment terms before accepting.", icon: HandCoins },
  traceability: { label: "Traceability", title: "Open any wool passport", text: "Enter a batch ID to see its complete chain of custody and QR.", icon: QrCode },
  quality: { label: "Quality", title: "Record laboratory measurements", text: "Save grade, micron and staple length directly to a live batch.", icon: ClipboardCheck },
  transport: { label: "Transport", title: "Request verified batch pickup", text: "Book a transporter against a registered wool batch.", icon: Truck },
  warehouses: { label: "Warehouses", title: "Reserve traceable wool storage", text: "Connect storage requests to the same batch passport.", icon: Warehouse },
  services: { label: "Services", title: "Book support around the farmer", text: "Request shearing, veterinary, assessment or processing services.", icon: Sprout },
  "market-prices": { label: "Market prices", title: "Live data and provider connections", text: "See what is live now and which official feeds still need credentials.", icon: BarChart3 },
};

type Batch = { id: string; breed: string; weight: number; grade: string; status: string; bids: number; price: number; source: string };
type Bid = { id: string; batchId: string; pricePerKg: number; pickupDays: number; paymentTerms: string; status: string };
type Booking = { id: string; batchId?: string; kind: string; providerName: string; scheduledAt: string; status: string };
type MarketQuote = { commodity: string; variety: string; market: string; district: string; state: string; minPrice: string; maxPrice: string; modalPrice: string; arrivalDate: string };
type Live = { updatedAt: string; location: string; weather: null | { temperatureC: number; humidityPercent: number; windKph: number }; market: MarketQuote[]; integrations: { id: string; label: string; status: string; detail: string }[] };

export default function WorkspaceClient({ module, user }: { module: WorkspaceModule; user: GoogleUser }) {
  const info = moduleInfo[module];
  const [batches, setBatches] = useState<Batch[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [live, setLive] = useState<Live | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => batches.filter((batch) => `${batch.id} ${batch.breed} ${batch.grade}`.toLowerCase().includes(search.toLowerCase())), [batches, search]);

  async function load() {
    const batchUrl = module === "woolkart" ? "/api/batches?scope=marketplace" : "/api/batches";
    const calls: Promise<Response>[] = [fetch(batchUrl, { cache: "no-store" })];
    if (module === "reverse-bidding") calls.push(fetch("/api/bids", { cache: "no-store" }));
    if (["transport", "warehouses", "services"].includes(module)) calls.push(fetch("/api/bookings", { cache: "no-store" }));
    if (module === "market-prices") calls.push(fetch("/api/live/overview", { cache: "no-store" }));
    const responses = await Promise.all(calls);
    const batchPayload = await responses[0].json() as { batches?: Batch[] };
    setBatches(batchPayload.batches ?? []);
    if (module === "reverse-bidding") setBids(((await responses[1].json()) as { bids?: Bid[] }).bids ?? []);
    if (["transport", "warehouses", "services"].includes(module)) setBookings(((await responses[1].json()) as { bookings?: Booking[] }).bookings ?? []);
    if (module === "market-prices") setLive(await responses[1].json() as Live);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load().catch(() => setMessage("This workspace could not load. Please try again.")); }, 0);
    return () => window.clearTimeout(timer);
    // Each module change intentionally reloads its own API collection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  async function submit(url: string, data: Record<string, FormDataEntryValue | string>, success: string, method = "POST") {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "The request could not be completed.");
      setMessage(success); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The request could not be completed."); }
    finally { setBusy(false); }
  }

  function formData(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); return Object.fromEntries(new FormData(event.currentTarget).entries()); }

  return <main className="workspace-page"><aside><Link href="/dashboard" className="portal-brand"><span className="brand-mark"><Sprout /></span> WoolTrace</Link><nav><Link href="/dashboard"><LayoutDashboard /> Overview</Link>{workspaceModules.map((item) => { const ItemIcon = moduleInfo[item].icon; return <Link className={item === module ? "active" : ""} href={`/workspace/${item}`} key={item}><ItemIcon /> {moduleInfo[item].label}</Link>; })}<Link href="/integrations"><PlugZap /> API setup</Link></nav><Link href="/portals"><ArrowLeft /> Stakeholder portals</Link></aside>
    <section className="workspace-content"><header><div><p className="kicker">{info.label.toUpperCase()}</p><h1>{info.title}</h1><p>{info.text}</p></div><span className="workspace-user">{user.name[0]}</span></header>
      {message && <div className={message.includes("not") || message.includes("could") || message.includes("valid") ? "workspace-message error" : "workspace-message"}>{message}</div>}
      {module === "my-wool" && <div className="workspace-two"><form className="workspace-form" onSubmit={(event) => { const data = formData(event); void submit("/api/batches", data, "Batch registered and QR passport created."); }}><p className="kicker">NEW BATCH</p><h2>Register at shearing</h2><label>Breed<input name="breed" required /></label><div><label>Weight (kg)<input name="weight" type="number" min="1" required /></label><label>Reserve ₹/kg<input name="reserve" type="number" min="0" required /></label></div><label>Shearing date<input name="date" type="date" required /></label><button disabled={busy}><PackagePlus /> {busy ? "Saving…" : "Create batch passport"}</button></form><BatchList batches={batches} empty="No live batches yet. Register your first shearing batch." /></div>}
      {module === "woolkart" && <><div className="workspace-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search breed, grade or batch ID" /></div><div className="market-grid">{filtered.map((batch) => <article key={batch.id}><div><span className="grade">{batch.grade}</span><small>{batch.status}</small></div><h2>{batch.breed}</h2><p>{batch.weight} kg · Reserve ₹{batch.price}/kg</p><div><Link href={`/batch/${batch.id}`}>View passport</Link><a href="#bid-form" onClick={() => setMessage(`Selected ${batch.id}. Enter this ID in the offer form below.`)}>Place offer</a></div></article>)}{!filtered.length && <div className="workspace-empty"><Store /><h2>No live listings</h2><p>Registered batches will appear here automatically.</p></div>}</div><form id="bid-form" className="workspace-form inline-form" onSubmit={(event) => { const data = formData(event); void submit("/api/bids", data, "Offer placed successfully."); }}><h2>Place a buyer offer</h2><label>Batch ID<input name="batchId" required /></label><label>₹ per kg<input name="pricePerKg" type="number" min="1" required /></label><label>Pickup days<input name="pickupDays" type="number" min="0" required /></label><label>Payment terms<input name="paymentTerms" required placeholder="e.g. Payment on pickup" /></label><button disabled={busy}><HandCoins /> Submit offer</button></form></>}
      {module === "reverse-bidding" && <div className="bid-workspace"><BatchList batches={batches} empty="Register a batch before collecting offers." /><section><h2>Live offers</h2>{bids.map((bid) => <article key={bid.id}><div><strong>₹{bid.pricePerKg}/kg</strong><small>{bid.batchId}</small></div><p>Pickup in {bid.pickupDays} days · {bid.paymentTerms}</p><span className={`status ${bid.status}`}>{bid.status}</span>{bid.status === "active" && <button disabled={busy} onClick={() => void submit("/api/bids", { bidId: bid.id, action: "accept" }, "Offer accepted. Ownership has been updated.", "PATCH")}>Accept offer</button>}</article>)}{!bids.length && <div className="workspace-empty"><HandCoins /><h2>No live offers yet</h2><p>Buyer offers placed through WoolKart will appear here.</p></div>}</section></div>}
      {module === "traceability" && <form className="trace-lookup" onSubmit={(event) => { const data = formData(event); window.location.assign(`/batch/${encodeURIComponent(String(data.batchId))}`); }}><QrCode /><p className="kicker">QR PASSPORT LOOKUP</p><h2>Enter a batch ID</h2><p>Open its origin, quality, ownership, logistics and processing history.</p><label>Batch ID<input name="batchId" defaultValue={batches[0]?.id ?? "WT-2408-KAS"} required /></label><button>Open wool passport</button><Link href="/batch/WT-2408-KAS">View the sample passport</Link></form>}
      {module === "quality" && <div className="workspace-two"><form className="workspace-form" onSubmit={(event) => { const data = formData(event); void submit("/api/batches/quality", data, "Quality measurements saved to the passport."); }}><p className="kicker">LAB RESULT</p><h2>Verify fibre quality</h2><label>Batch ID<input name="batchId" required /></label><div><label>Grade<input name="grade" required placeholder="A" /></label><label>Micron<input name="micron" type="number" step="0.1" required /></label></div><div><label>Staple length (mm)<input name="stapleMm" type="number" required /></label><label>Laboratory<input name="location" required /></label></div><button disabled={busy}><BadgeCheck /> Save verified result</button></form><BatchList batches={batches} empty="No batch is ready for quality testing." /></div>}
      {(["transport", "warehouses", "services"] as WorkspaceModule[]).includes(module) && <div className="workspace-two"><BookingForm module={module} busy={busy} batches={batches} onSubmit={(data) => void submit("/api/bookings", data, "Booking request saved.")} /><section className="booking-list"><p className="kicker">YOUR REQUESTS</p><h2>Bookings</h2>{bookings.map((booking) => <article key={booking.id}><span><CheckCircle2 /></span><div><strong>{booking.providerName}</strong><small>{booking.kind} · {new Date(booking.scheduledAt).toLocaleDateString("en-IN")}</small></div><i>{booking.status}</i></article>)}{!bookings.length && <div className="workspace-empty"><Warehouse /><h2>No bookings yet</h2><p>Your saved requests will appear here.</p></div>}</section></div>}
      {module === "market-prices" && <><section className="connections-page"><div className="weather-panel"><p className="kicker">LIVE FARM CONDITIONS</p><h2>{live?.weather ? `${Math.round(live.weather.temperatureC)}°C` : "Unavailable"}</h2><p>{live?.location ?? "Gulmarg"}</p>{live?.weather && <small>{live.weather.humidityPercent}% humidity · {Math.round(live.weather.windKph)} km/h wind</small>}</div><div className="connections-list"><p className="kicker">DATA PROVIDERS</p><h2>Connection status</h2>{live?.integrations.map((item) => <article key={item.id}><span className={item.status} /><div><strong>{item.label}</strong><small>{item.detail}</small></div><b>{item.status === "live" ? "Live" : item.status === "configured" ? "Configured" : item.status === "setup_required" ? "Setup required" : "Unavailable"}</b></article>)}<Link className="connection-setup-link" href="/integrations"><PlugZap /> Open production setup</Link></div></section><section className="market-feed"><div><p className="kicker">GOVERNMENT MARKET FEED</p><h2>Latest mandi records</h2></div>{live?.market?.length ? <div>{live.market.map((quote, index) => <article key={`${quote.market}-${quote.commodity}-${index}`}><span>{quote.arrivalDate || "Latest"}</span><h3>{quote.commodity || "Commodity"}</h3><p>{quote.variety || "General variety"} · {quote.market || quote.district}</p><strong>{quote.modalPrice ? `₹${quote.modalPrice}` : "Price unavailable"}<small> modal price</small></strong><small>{[quote.district, quote.state].filter(Boolean).join(", ")}</small></article>)}</div> : <div className="market-feed-empty"><BarChart3 /><h3>Connect data.gov.in to load real mandi records</h3><p>Add the API key and AGMARKNET resource ID shown in Production setup. WoolTrace will verify the response before marking the feed live.</p><Link href="/integrations">View required variables</Link></div>}</section></>}
    </section>
  </main>;
}

function BatchList({ batches, empty }: { batches: Batch[]; empty: string }) { return <section className="workspace-list"><p className="kicker">LIVE RECORDS</p><h2>Wool batches</h2>{batches.map((batch) => <Link href={`/batch/${batch.id}`} key={batch.id}><QrCode /><div><strong>{batch.id}</strong><small>{batch.breed} · {batch.weight} kg · Grade {batch.grade}</small></div><span>{batch.status}</span></Link>)}{!batches.length && <div className="workspace-empty"><Boxes /><h2>Nothing here yet</h2><p>{empty}</p></div>}</section>; }

function BookingForm({ module, busy, batches, onSubmit }: { module: WorkspaceModule; busy: boolean; batches: Batch[]; onSubmit: (data: Record<string, FormDataEntryValue | string>) => void }) {
  const kind = module === "transport" ? "transport" : module === "warehouses" ? "warehouse" : "shearing";
  return <form className="workspace-form" onSubmit={(event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); onSubmit({ ...data, kind: module === "services" ? String(data.kind) : kind }); }}><p className="kicker">NEW REQUEST</p><h2>{module === "transport" ? "Book transport" : module === "warehouses" ? "Reserve storage" : "Book a farm service"}</h2><label>Live batch<select name="batchId" required><option value="">Choose batch</option>{batches.map((batch) => <option key={batch.id}>{batch.id}</option>)}</select></label>{module === "services" && <label>Service type<select name="kind" defaultValue="shearing"><option value="shearing">Shearing</option><option value="veterinary">Veterinary</option><option value="quality">Quality assessment</option><option value="processing">Processing</option></select></label>}<label>Provider<input name="providerName" required placeholder={module === "transport" ? "Transport company" : module === "warehouses" ? "Warehouse name" : "Service provider"} /></label><label>Required date<input name="scheduledAt" type="date" required /></label><button disabled={busy}>{module === "transport" ? <Truck /> : <Warehouse />} {busy ? "Saving…" : "Request booking"}</button></form>;
}
