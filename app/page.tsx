"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, BarChart3, Boxes, CheckCircle2, ChevronRight,
  Globe2, HandCoins, Languages, Menu, PackageCheck, QrCode, ShieldCheck,
  Sprout, Truck, Warehouse, X,
} from "lucide-react";
import { useState } from "react";
import { portalDefinitions, portalRoles, woolStages } from "@/app/lib/portals";

const journey = [
  { number: "01", title: "Register the shearing", text: "Create a digital batch with the farm, breed, date and weight recorded at source.", icon: Boxes, href: "/workspace/my-wool" },
  { number: "02", title: "Verify wool quality", text: "Attach grade, micron, staple length, yield and the assessor’s signed certificate.", icon: BadgeCheck, href: "/portal/laboratory" },
  { number: "03", title: "Invite buyer offers", text: "Verified buyers compete on price, pickup time, deductions and payment terms.", icon: HandCoins, href: "/portal/buyer" },
  { number: "04", title: "Track every hand-off", text: "Transport, storage, processing, yarn and fabric stay linked to the source batch.", icon: PackageCheck, href: "/portals" },
];

const capabilities = [
  [QrCode, "QR wool passports", "One scan shows origin, quality, ownership and the complete chain of custody.", "/batch/WT-2408-KAS"],
  [HandCoins, "Reverse bidding", "Farmers compare competing offers and accept the best net value on their own terms.", "/portal/buyer"],
  [Truck, "Connected logistics", "Book transport and storage without losing visibility of the batch.", "/portal/transporter"],
  [BarChart3, "Market intelligence", "See live provider status and practical reserve-price information.", "/workspace/market-prices"],
] as const;

function Mark() {
  return <span className="khet-mark"><Sprout aria-hidden="true" /></span>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const hindi = language === "हिंदी";

  return (
    <main className="khet-page">
      <header className="khet-topbar">
        <a href="#home" className="khet-brand" aria-label="WoolTrace home"><Mark /><strong>WOOLTRACE</strong></a>
        <nav className="khet-nav" aria-label="Main navigation">
          <a href="#how">{hindi ? "यह कैसे काम करता है" : "How it works"}</a><a href="#platform">{hindi ? "प्लेटफ़ॉर्म" : "Platform"}</a><a href="#lifecycle">{hindi ? "ऊन की यात्रा" : "Wool journey"}</a><a href="/portals">{hindi ? "पोर्टल" : "Portals"}</a>
        </nav>
        <div className="khet-header-actions">
          <label className="khet-language"><Languages aria-hidden="true" /><span className="sr-only">Change language</span><select value={language} onChange={(event) => { setLanguage(event.target.value); document.documentElement.lang = event.target.value === "हिंदी" ? "hi" : "en"; }} aria-label="Change language"><option>English</option><option>हिंदी</option></select></label>
          <a className="khet-signin" href="/login">{hindi ? "Google से साइन इन" : "Sign in with Google"}</a>
          <a className="khet-open" href="/dashboard">{hindi ? "प्लेटफ़ॉर्म खोलें" : "Open platform"} <ArrowRight /></a>
        </div>
        <button className="khet-menu" type="button" aria-expanded={menuOpen} aria-label="Toggle menu" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      {menuOpen && <nav className="khet-mobile-nav"><a href="#how" onClick={() => setMenuOpen(false)}>{hindi ? "यह कैसे काम करता है" : "How it works"}</a><a href="#platform" onClick={() => setMenuOpen(false)}>{hindi ? "प्लेटफ़ॉर्म" : "Platform"}</a><a href="#lifecycle" onClick={() => setMenuOpen(false)}>{hindi ? "ऊन की यात्रा" : "Wool journey"}</a><a href="/portals">{hindi ? "पोर्टल चुनें" : "Choose a portal"}</a><a href="/login">{hindi ? "Google से साइन इन" : "Sign in with Google"}</a><a className="khet-open" href="/dashboard">{hindi ? "प्लेटफ़ॉर्म खोलें" : "Open platform"} <ArrowRight /></a></nav>}

      <section id="home" className="khet-hero">
        <div className="khet-hero-copy">
          <div className="khet-chip"><span /> {hindi ? "किसान-प्रथम ऊन जानकारी" : "Farmer-first wool intelligence"}</div>
          <h1>{hindi ? "अपनी ऊन को जानें।" : "Know your wool."}<br /><em>{hindi ? "विश्वास के साथ बेचें।" : "Sell with confidence."}</em></h1>
          <p>{hindi ? "WoolTrace हर बैच को सत्यापित पहचान देता है, किसानों को भरोसेमंद खरीदारों से सीधे जोड़ता है और कतराई से कपड़े तक पूरी यात्रा दिखाता है।" : "WoolTrace gives every batch a verified identity, connects farmers directly with trusted buyers, and keeps the whole journey visible from shearing to fabric."}</p>
          <div className="khet-hero-actions"><a className="khet-primary" href="/dashboard">{hindi ? "WoolTrace देखें" : "Explore WoolTrace"} <ArrowRight /></a><a className="khet-secondary" href="#how">{hindi ? "कार्यप्रणाली देखें" : "See how it works"} <ChevronRight /></a></div>
          <div className="khet-proof"><div className="khet-avatars"><span>R</span><span>S</span><span>A</span><span>+</span></div><p><strong>{hindi ? "किसान केंद्र में" : "Built with farmers at the centre"}</strong><small>{hindi ? "किसान · खरीदार · मूल्यांकनकर्ता · प्रसंस्करणकर्ता" : "Farmers · buyers · assessors · processors"}</small></p></div>
        </div>
        <div className="khet-visual">
          <div className="khet-photo-card"><Image src="/wooltrace-hero.png" alt="Indian wool farmer holding freshly shorn wool beside sheep" fill priority sizes="(max-width: 900px) 92vw, 46vw" className="object-cover" /><div className="khet-photo-label"><ShieldCheck /><div><strong>Origin verified</strong><span>Gulmarg · Kashmir Merino</span></div></div></div>
          <article className="khet-signal-card"><span>Sample market signal</span><strong>Strong demand</strong><p><b>↑ 8.4%</b> above reserve</p><div className="signal-bars"><i /><i /><i /><i /></div></article>
          <article className="khet-buyer-card"><span><BadgeCheck /> Sample buyer match</span><strong>Himalaya Weaves</strong><p>96% batch-fit score</p><div><b>₹612/kg</b><small>Pickup in 2 days</small></div></article>
          <span className="khet-orbit orbit-one" /><span className="khet-orbit orbit-two" />
        </div>
      </section>

      <section className="khet-metrics" aria-label="WoolTrace platform example"><div><strong>₹612/kg</strong><span>sample leading offer</span></div><div><strong>184 kg</strong><span>sample verified batch</span></div><div><strong>8 portals</strong><span>role-specific workspaces</span></div><div><strong>10 stages</strong><span>farm-to-product trail</span></div></section>

      <section className="landing-portals"><div><span className="khet-eyebrow">One platform, the right workspace</span><h2>Every participant records their part.</h2><p>No repeated forms and no broken paper trail. Each portal adds a signed event to the same wool passport.</p><a href="/portals">View all portals <ArrowRight /></a></div><div>{portalRoles.map((role) => { const portal = portalDefinitions[role]; const Icon = portal.icon; return <a href={`/portal/${role}`} key={role}><Icon /><span><strong>{portal.short}</strong><small>{portal.owns[0]}</small></span><ChevronRight /></a>; })}</div></section>

      <section id="how" className="khet-section khet-how">
        <div className="khet-section-heading"><div><span className="khet-eyebrow">One connected wool journey</span><h2>Less uncertainty.<br />More bargaining power.</h2></div><p>Every record, service and sale comes together in one farmer-first workflow. Useful partners stay connected, while unnecessary trading layers disappear.</p></div>
        <div className="khet-steps">{journey.map(({ number, title, text, icon: Icon, href }) => <article key={number}><div><span>{number}</span><Icon /></div><h3>{title}</h3><p>{text}</p><a href={href}>Open workflow <ChevronRight /></a></article>)}</div>
      </section>

      <section id="platform" className="khet-platform">
        <div className="khet-platform-copy"><span className="khet-eyebrow light">Made for farmer ownership</span><h2>Your wool business,<br />all in one place.</h2><p>Register batches, book assessments, compare buyer offers, arrange pickup and show customers exactly where their fibre began.</p><a className="khet-primary" href="/dashboard">View farmer workspace <ArrowRight /></a><div className="khet-checks"><p><CheckCircle2 /> Keep ownership visible</p><p><CheckCircle2 /> Compare true net earnings</p><p><CheckCircle2 /> Share verified batch history</p></div></div>
        <div className="khet-workspace-card"><div className="workspace-top"><div><span>ACTIVE BATCH</span><strong>WT-2408-KAS</strong></div><QrCode /></div><div className="workspace-quality"><span><small>Grade</small><b>A</b></span><span><small>Micron</small><b>20.4</b></span><span><small>Weight</small><b>184 kg</b></span></div><div className="workspace-offer"><div><small>Leading offer</small><strong>₹612<em>/kg</em></strong></div><span>7 verified bids</span></div><div className="workspace-route"><span className="done"><CheckCircle2 /></span><i /><span className="done"><BadgeCheck /></span><i /><span className="active"><HandCoins /></span><i /><span><Truck /></span></div><div className="workspace-labels"><span>Sheared</span><span>Graded</span><span>Auction</span><span>Pickup</span></div></div>
      </section>

      <section className="khet-section khet-capabilities">
        <div className="khet-section-heading"><div><span className="khet-eyebrow">Built around the batch</span><h2>Everything farmers need<br />to protect wool’s value.</h2></div><p>Operational tools stay simple on mobile, while each verified update strengthens the public wool passport.</p></div>
        <div className="khet-cap-grid">{capabilities.map(([Icon, title, text, href]) => <a href={href} key={title}><Icon /><h3>{title}</h3><p>{text}</p><span>Use this tool <ArrowRight /></span></a>)}</div>
      </section>

      <section id="lifecycle" className="landing-lifecycle"><div className="khet-section-heading"><div><span className="khet-eyebrow">The complete wool lifecycle</span><h2>From sheep to shelf,<br />the source stays visible.</h2></div><p>When a batch becomes yarn, fabric or several finished products, every child lot continues to point back to the original farm record.</p></div><div>{woolStages.map((stage, index) => { const Icon = stage.icon; return <article key={stage.key}><span>{String(index + 1).padStart(2, "0")}</span><Icon /><h3>{stage.title}</h3><p>{stage.detail}</p><small>{stage.owner}</small></article>; })}</div><Link className="khet-primary" href="/batch/WT-2408-KAS">Scan the sample journey <QrCode /></Link></section>

      <section id="trust" className="khet-trust">
        <div><span className="khet-eyebrow light">Verified. Transparent. Accountable.</span><h2>A more dependable wool economy.</h2><p>Farmer identity, laboratory quality, buyer credentials, logistics status and every ownership milestone appear in one shared record.</p></div><div className="khet-trust-grid"><article><ShieldCheck /><strong>Signed events</strong><span>Every update belongs to a verified stakeholder.</span></article><article><Warehouse /><strong>Visible custody</strong><span>Storage and transport never break the batch history.</span></article><article><Globe2 /><strong>Public proof</strong><span>Anyone can scan the QR without seeing private farm data.</span></article></div>
      </section>

      <section className="landing-final-cta"><div><span className="khet-eyebrow light">Ready when the wool is sheared</span><h2>Create the first verified batch record.</h2></div><div><Link className="khet-primary" href="/workspace/my-wool">Register wool <ArrowRight /></Link><Link href="/portals">Choose your portal <ChevronRight /></Link></div></section>

      <footer className="khet-footer"><div><a href="#home" className="khet-brand"><Mark /><strong>WOOLTRACE</strong></a><p>Farm-to-product traceability and direct wool commerce for Indian farmers.</p></div><div><strong>PLATFORM</strong><a href="#how">How it works</a><a href="#lifecycle">Wool lifecycle</a><Link href="/portals">Stakeholder portals</Link></div><div><strong>ACCESS</strong><Link href="/login">Google sign-in</Link><Link href="/dashboard">Farmer dashboard</Link><Link href="/batch/WT-2408-KAS">Sample passport</Link></div><div><strong>LANGUAGES</strong><p>English · हिंदी · ಕನ್ನಡ<br />தமிழ் · తెలుగు · मराठी</p></div><small>© 2026 WoolTrace · From sheep to shelf, clearly.</small></footer>
    </main>
  );
}
