"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck, BarChart3, Bell, Boxes, ChevronRight, ClipboardCheck, Gauge,
  HandCoins, Languages, LayoutDashboard, LogOut, Menu, PackagePlus, QrCode,
  Search, Settings, ShieldCheck, Sprout, Store, Truck, UsersRound, Warehouse, X,
} from "lucide-react";
import type { GoogleUser } from "@/app/lib/google-auth";

const modules = [
  ["Overview", LayoutDashboard], ["My wool", Boxes], ["WoolKart", Store],
  ["Reverse bidding", HandCoins], ["Traceability", QrCode], ["Quality", ClipboardCheck],
  ["Transport", Truck], ["Warehouses", Warehouse], ["Services", Sprout],
  ["Market prices", BarChart3],
] as const;

const journey = [
  ["Sheared", "Gulmarg farm", "12 Sep, 08:20"], ["Quality verified", "Pashmina Lab, Srinagar", "13 Sep, 14:10"],
  ["Auction live", "WoolKart", "14 Sep, 09:00"], ["Pickup scheduled", "Himalayan Logistics", "16 Sep, 11:30"],
];

type Batch = { id: string; breed: string; weight: number; grade: string; status: string; bids: number; price: number; source: "live" | "demo" };
type LiveOverview = {
  updatedAt: string;
  location: string;
  weather: null | { temperatureC: number; humidityPercent: number; windKph: number; precipitationMm: number; source: string };
  integrations: { id: string; label: string; status: "live" | "setup_required" | "unavailable"; detail: string }[];
  liveCount: number;
  totalCount: number;
};

const initialBatches: Batch[] = [
  { id: "WT-2408-KAS", breed: "Kashmir Merino", weight: 184, grade: "A", status: "Auction live", bids: 7, price: 612, source: "demo" },
  { id: "WT-2407-HIM", breed: "Gaddi", weight: 126, grade: "B+", status: "Quality check", bids: 0, price: 438, source: "demo" },
  { id: "WT-2406-LAD", breed: "Changthangi", weight: 48, grade: "A+", status: "Sold", bids: 11, price: 1480, source: "demo" },
];

export default function DashboardClient({ user }: { user: GoogleUser }) {
  const [active, setActive] = useState("Overview");
  const [mobile, setMobile] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [batches, setBatches] = useState(initialBatches);
  const [language, setLanguage] = useState("English");
  const [live, setLive] = useState<LiveOverview | null>(null);
  const [liveError, setLiveError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [popover, setPopover] = useState<"notifications" | "settings" | null>(null);
  const bestValue = useMemo(() => batches.reduce((sum, batch) => sum + batch.weight * batch.price, 0), [batches]);
  const visibleBatches = useMemo(() => batches.filter((batch) => `${batch.id} ${batch.breed} ${batch.status}`.toLowerCase().includes(search.toLowerCase())), [batches, search]);

  useEffect(() => {
    let mounted = true;
    const loadLiveData = async () => {
      try {
        const [overviewResponse, batchResponse] = await Promise.all([fetch("/api/live/overview", { cache: "no-store" }), fetch("/api/batches", { cache: "no-store" })]);
        if (!overviewResponse.ok) throw new Error("Live services are not responding.");
        const overview = await overviewResponse.json() as LiveOverview;
        if (mounted) { setLive(overview); setLiveError(""); }
        if (batchResponse.ok) {
          const payload = await batchResponse.json() as { batches: Batch[] };
          if (mounted && payload.batches.length) setBatches([...payload.batches, ...initialBatches]);
        }
      } catch (error) {
        if (mounted) setLiveError(error instanceof Error ? error.message : "Live services are unavailable.");
      }
    };
    void loadLiveData();
    const timer = window.setInterval(loadLiveData, 60_000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    const requested = window.location.hash.slice(1).replace(/-/g, " ");
    const match = modules.find(([label]) => label.toLowerCase() === requested.toLowerCase());
    if (match) setActive(match[0]);
  }, []);

  async function createBatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breed: data.get("breed"), weight: data.get("weight"), reserve: data.get("reserve"), date: data.get("date") }),
      });
      const payload = await response.json() as { batch?: Batch; error?: string };
      if (!response.ok || !payload.batch) throw new Error(payload.error ?? "The batch could not be saved.");
      setBatches((current) => [payload.batch!, ...current]);
      setShowCreate(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The batch could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className={`app-sidebar ${mobile ? "show" : ""}`}>
        <div className="app-logo"><span className="brand-mark"><Sprout className="size-4" /></span><span>WoolTrace</span><button onClick={() => setMobile(false)}><X /></button></div>
        <p className="side-label">WORKSPACE</p>
        <nav>{modules.map(([label, Icon]) => <button className={active === label ? "active" : ""} key={label} onClick={() => { setActive(label); setMobile(false); }}><Icon /><span>{label}</span>{label === "Reverse bidding" && <b>7</b>}</button>)}</nav>
        <div className="side-bottom"><Link href="/portals"><UsersRound /> Switch portal</Link><button onClick={() => setPopover("settings")}><Settings /> Settings</button><a href="/api/auth/logout"><LogOut /> Sign out</a></div>
      </aside>

      <section className="app-main">
        <header className="app-header">
          <button className="app-menu" onClick={() => setMobile(true)}><Menu /></button>
          <div><p className="kicker">FARMER WORKSPACE</p><h1>{active}</h1></div>
          <div className="app-actions"><label><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search batches" /></label><Link className="portal-switch" href="/portals"><UsersRound /> Portals</Link><button className="icon-button" aria-label="Notifications" onClick={() => setPopover(popover === "notifications" ? null : "notifications")}><Bell /></button><button className="language" onClick={() => setLanguage(language === "English" ? "हिन्दी" : "English")}><Languages /> {language}</button><div className="avatar">{user.picture ? <img src={user.picture} alt="" /> : user.name[0]}</div>{popover === "notifications" && <div className="app-popover"><strong>Notifications</strong><p>Weather and traceability data are connected.</p><p>Demo batch WT-2408-KAS has 7 sample offers.</p><button onClick={() => setPopover(null)}>Mark as read</button></div>}</div>
        </header>

        {active === "Overview" ? <>
          <section className="welcome-card"><div><p className="kicker light">GOOD MORNING, {user.name.split(" ")[0].toUpperCase()}</p><h2>Your wool is earning<br />what it is worth.</h2><p>Seven verified buyers are competing for batch WT-2408-KAS. The highest offer is 8.4% above your reserve price.</p><button onClick={() => setActive("Reverse bidding")}>Review live offers <ChevronRight /></button></div><div className="welcome-price"><span>Best live offer</span><strong>₹612<small>/kg</small></strong><em>+8.4% above reserve</em></div></section>
          <section className="live-data-strip" aria-live="polite">
            <div className="live-data-heading"><div><span className="live-dot" /> LIVE DATA</div><small>{live ? `Updated ${new Date(live.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : liveError || "Connecting…"}</small></div>
            <article><p>Farm weather</p>{live?.weather ? <><strong>{Math.round(live.weather.temperatureC)}°C</strong><small>{live.location} · {live.weather.humidityPercent}% humidity · {Math.round(live.weather.windKph)} km/h wind</small></> : <><strong>—</strong><small>Waiting for provider</small></>}</article>
            <article><p>Data connections</p><strong>{live ? `${live.liveCount}/${live.totalCount}` : "—"}</strong><small>Live and credential-verified</small></article>
            <article className="connection-summary"><p>Provider status</p><div>{live?.integrations.slice(0, 4).map((item) => <span className={item.status} key={item.id}><i />{item.label}<b>{item.status === "live" ? "Live" : item.status === "setup_required" ? "Setup required" : "Unavailable"}</b></span>) ?? <small>Checking integrations…</small>}</div></article>
          </section>
          <section className="metric-grid">
            <article><span><Boxes /></span><p>Active wool</p><strong>{batches.reduce((sum, b) => sum + b.weight, 0)} kg</strong><small>Across {batches.length} batches</small></article>
            <article><span><HandCoins /></span><p>Estimated value</p><strong>₹{Math.round(bestValue / 1000)}k</strong><small>At current best offers</small></article>
            <article><span><BadgeCheck /></span><p>Verified batches</p><strong>2 / {batches.length}</strong><small>One assessment pending</small></article>
            <article><span><Gauge /></span><p>Connected APIs</p><strong>{live ? `${live.liveCount}/${live.totalCount}` : "—"}</strong><small>{liveError || "Weather, records and providers"}</small></article>
          </section>
          <section className="dashboard-grid">
            <article className="panel batch-panel"><div className="panel-head"><div><p className="kicker">MY WOOL</p><h3>{search ? `Search results (${visibleBatches.length})` : "Recent batches"}</h3></div><button className="lime-button" onClick={() => setShowCreate(true)}><PackagePlus /> Add batch</button></div><div className="batch-table"><div className="batch-row head"><span>Batch</span><span>Weight</span><span>Grade</span><span>Status</span><span>Reserve / offer</span></div>{visibleBatches.map((batch) => <a href={`/batch/${batch.id}`} className="batch-row" key={batch.id}><span><strong>{batch.id}</strong><small>{batch.breed} · {batch.source === "live" ? "Saved record" : "Demo data"}</small></span><span>{batch.weight} kg</span><span><b className="grade">{batch.grade}</b></span><span><i className={`status ${batch.status.toLowerCase().replace(" ", "-")}`}>{batch.status}</i></span><span><strong>₹{batch.price}/kg</strong><small>{batch.bids ? `${batch.bids} demo buyer offers` : "Awaiting assessment"}</small></span></a>)}{!visibleBatches.length && <p className="empty-search">No batches match “{search}”.</p>}</div></article>
            <article className="panel timeline-panel"><div className="panel-head"><div><p className="kicker">LIVE PASSPORT</p><h3>WT-2408-KAS</h3></div><Link href="/batch/WT-2408-KAS"><QrCode /></Link></div><div className="mini-journey">{journey.map(([title, place, time], index) => <div key={title} className={index < 3 ? "done" : ""}><span>{index < 3 ? <ShieldCheck /> : <Truck />}</span><p><strong>{title}</strong><small>{place}</small></p><time>{time}</time></div>)}</div><Link className="text-link" href="/batch/WT-2408-KAS">Open public batch passport <ChevronRight /></Link></article>
          </section>
        </> : <ModuleView name={active} onCreate={() => setShowCreate(true)} batches={batches} />}
      </section>

      {popover === "settings" && <div className="modal-backdrop"><div className="portal-modal"><button className="modal-close" onClick={() => setPopover(null)}><X /></button><Settings /><p className="kicker">WORKSPACE SETTINGS</p><h2>Your preferences</h2><p>Choose the interface language or move to another stakeholder portal.</p><label>Language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option><option>हिन्दी</option></select></label><Link className="lime-button settings-link" href="/portals"><UsersRound /> Choose portal</Link></div></div>}
      {showCreate && <div className="modal-backdrop"><form className="batch-modal" onSubmit={createBatch}><button type="button" className="modal-close" onClick={() => setShowCreate(false)}><X /></button><p className="kicker">NEW DIGITAL PASSPORT</p><h2>Register a wool batch</h2><p>Start the verified history at the point of shearing. This record is saved securely to WoolTrace.</p><label>Breed<input name="breed" required placeholder="e.g. Kashmir Merino" /></label><div className="form-pair"><label>Weight (kg)<input name="weight" required min="1" type="number" /></label><label>Reserve ₹/kg<input name="reserve" required min="0" type="number" /></label></div><label>Shearing date<input name="date" required type="date" /></label>{saveError && <p className="form-error">{saveError}</p>}<button className="lime-button" type="submit" disabled={isSaving}>{isSaving ? "Saving batch…" : "Create batch & QR"} <QrCode /></button></form></div>}
    </main>
  );
}

function ModuleView({ name, onCreate, batches }: { name: string; onCreate: () => void; batches: Batch[] }) {
  const copy: Record<string, [string, string]> = {
    "My wool": ["Every batch in one place", "Register wool at shearing, maintain quality records and open its public QR passport."],
    WoolKart: ["Sell directly to verified buyers", "List assessed wool, compare demand and choose the terms that protect your net earnings."],
    "Reverse bidding": ["Buyers compete. Farmers decide.", "Compare price, pickup time, deductions, payment terms and buyer reliability side by side."],
    Traceability: ["One passport from farm to fabric", "Every custody, transport, storage and processing event remains linked to the source batch."],
    Quality: ["Quality proof that travels", "Record micron, staple length, yield, colour, contamination and signed laboratory certificates."],
    Transport: ["Visible pickup and delivery", "Book verified transport, share custody records and track the current batch location."],
    Warehouses: ["Find verified storage nearby", "Compare capacity, distance, price, insurance and environmental controls before booking."],
    Services: ["Support around the farmer", "Book shearers, veterinarians, breeders, assessors, logistics and processors from one directory."],
    "Market prices": ["Know the market before selling", "Follow grade-wise prices, district demand, historic trends and recommended reserve ranges."],
  };
  const [title, text] = copy[name] ?? [name, "WoolTrace module"];
  const workflowLinks: Record<string, string> = { WoolKart: "/portal/buyer", "Reverse bidding": "/portal/buyer", Traceability: "/batch/WT-2408-KAS", Quality: "/portal/laboratory", Transport: "/portal/transporter", Warehouses: "/portal/warehouse", Services: "/portals", "Market prices": "/dashboard" };
  return <section className="module-page"><div className="module-hero"><p className="kicker">{name.toUpperCase()}</p><h2>{title}</h2><p>{text}</p>{name === "My wool" ? <button className="lime-button" onClick={onCreate}><PackagePlus /> Register batch</button> : <Link className="lime-button" href={workflowLinks[name] ?? "/portals"}>Open workflow <ChevronRight /></Link>}</div><div className="module-cards"><article><BadgeCheck /><h3>Verified records</h3><p>Time-stamped updates keep every stakeholder accountable.</p></article><article><ShieldCheck /><h3>Farmer control</h3><p>Nothing changes ownership without a recorded acceptance.</p></article><article><Languages /><h3>Multilingual access</h3><p>Switch the interface between English and Hindi.</p></article></div>{name === "Reverse bidding" && <div className="offer-board"><h3>Demo offers for WT-2408-KAS</h3>{[["Himalaya Weaves",612,"Pickup in 2 days"],["North Loom Co.",598,"Same-day payment"],["Kashmir Textiles",584,"Pickup in 1 day"]].map(([buyer,price,term],i)=><div key={String(buyer)}><span>#{i+1}</span><p><strong>{buyer}</strong><small>Demo buyer · {term}</small></p><b>₹{price}/kg</b><Link href="/portal/buyer">{i === 0 ? "Review demo" : "View terms"}</Link></div>)}</div>}{name === "My wool" && <div className="module-list">{batches.map(b => <a href={`/batch/${b.id}`} key={b.id}><QrCode /><p><strong>{b.id}</strong><small>{b.breed} · {b.weight} kg · Grade {b.grade} · {b.source === "live" ? "Saved" : "Demo"}</small></p><ChevronRight /></a>)}</div>}</section>;
}
