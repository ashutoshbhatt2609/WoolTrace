"use client";

import Image from "next/image";
import PastureScene from "@/app/components/pasture-scene";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, BarChart3, Boxes, CheckCircle2, ChevronRight,
  Globe2, HandCoins, Menu, PackageCheck, QrCode, ShieldCheck,
  Sprout, Truck, Warehouse, X,
} from "lucide-react";
import { useState } from "react";
import { portalDefinitions, portalRoles, woolStages } from "@/app/lib/portals";

const journey = [
  { number: "01", title: "Register the shearing", text: "Create a digital batch with the farm, breed, date and weight recorded at source.", icon: Boxes, href: "/workspace/my-wool" },
  { number: "02", title: "Add wool quality results", text: "Attach grade, micron and staple length when a laboratory is invited to record results.", icon: BadgeCheck, href: "/portal/laboratory" },
  { number: "03", title: "Invite buyer offers", text: "Buyers compete on price, pickup time and payment terms.", icon: HandCoins, href: "/portal/buyer" },
  { number: "04", title: "Track every hand-off", text: "Transport, storage, processing, yarn and fabric stay linked to the source batch.", icon: PackageCheck, href: "/portals" },
];

const capabilities = [
  [QrCode, "QR wool passports", "One scan shows origin, farmer evidence, quality, ownership and every recorded handoff.", "/batch/WT-2610-KAR"],
  [HandCoins, "Reverse bidding", "Farmers compare competing offers and accept the best net value on their own terms.", "/portal/buyer"],
  [Truck, "Connected logistics", "Plan transport and storage, then invite partners to record handoffs.", "/portal/transporter"],
  [BarChart3, "Direct market access", "See farmer-listed wool and prices submitted by buyers.", "/workspace/woolkart"],
] as const;

function Mark() {
  return <span className="khet-mark"><Sprout aria-hidden="true" /></span>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const hindi = false;

  return (
    <main className="khet-page pastoral-theme">
      <header className="khet-topbar">
        <a href="#home" className="khet-brand" aria-label="WoolTrace home"><Mark /><strong>WoolTrace.</strong></a>
        <nav className="khet-nav" aria-label="Main navigation">
          <a href="#how">{hindi ? "यह कैसे काम करता है" : "How it works"}</a><a href="#platform">{hindi ? "प्लेटफ़ॉर्म" : "Platform"}</a><a href="#lifecycle">{hindi ? "ऊन की यात्रा" : "Wool journey"}</a><a href="#roles">{hindi ? "पोर्टल" : "Your workspace"}</a>
        </nav>
        <div className="khet-header-actions">
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
          <p>{hindi ? "WoolTrace किसान द्वारा दर्ज स्रोत, फोटो और हर अगले हस्तांतरण को एक QR यात्रा में रखता है।" : "WoolTrace keeps the farmer-recorded source, shearing photo and every later handoff together in one QR journey."}</p>
          <div className="khet-hero-actions"><a className="khet-primary" href="/dashboard">{hindi ? "WoolTrace देखें" : "Explore WoolTrace"} <ArrowRight /></a><Link className="khet-secondary" href="/demo">{hindi ? "कार्यप्रणाली देखें" : "Try a role demo"} <ChevronRight /></Link></div>
          <div className="khet-proof"><div className="khet-avatars"><span>R</span><span>S</span><span>A</span><span>+</span></div><p><strong>{hindi ? "किसान केंद्र में" : "Built with farmers at the centre"}</strong><small>{hindi ? "किसान · खरीदार · मूल्यांकनकर्ता · प्रसंस्करणकर्ता" : "Farmers · buyers · assessors · processors"}</small></p></div>
        </div>
        <div className="khet-visual">
          <div className="khet-photo-card"><Image src="/wooltrace-hero.png" alt="Indian wool farmer holding freshly shorn wool beside sheep" fill priority sizes="(max-width: 900px) 92vw, 46vw" className="object-cover" /><div className="khet-photo-label"><ShieldCheck /><div><strong>It begins with the farmer</strong><span>From fleece to finished fabric</span></div></div></div>
          <article className="khet-signal-card"><span>ONE CONNECTED RECORD</span><strong>Follow the fibre.</strong><p>Farm · shearing · processing</p><QrCode size={36}/></article>
          <article className="khet-buyer-card"><span><Sprout /> Farmer-first commerce</span><strong>Your wool. Your terms.</strong><p>Compare offers directly.<br/>Choose who you sell to.</p><div><b>No middlemen</b><small>Direct UPI payment</small></div></article>
          <span className="khet-orbit orbit-one" /><span className="khet-orbit orbit-two" />
        </div>
      </section>

      <PastureScene className="wt-landing-pasture"/>
      <section className="khet-metrics" aria-label="How WoolTrace connects wool"><div><strong>One QR</strong><span>the recorded wool journey</span></div><div><strong>Your terms</strong><span>direct buyer offers</span></div><div><strong>7 roles</strong><span>connected workspaces</span></div><div><strong>Farm to fabric</strong><span>source-linked output lots</span></div></section>

      <section className="landing-portals" id="roles"><div><span className="khet-eyebrow">One platform, the right workspace</span><h2>Every participant records their part.</h2><p>Farmers record the origin. Invited partners add their stage to a shared, hash-linked wool passport.</p><Link href="/demo">Explore the role demos <ArrowRight /></Link></div><div>{portalRoles.map((role) => { const portal = portalDefinitions[role]; const Icon = portal.icon; return <a href={`/demo/${role}`} key={role}><Icon /><span><strong>{portal.short}</strong><small>{portal.owns[0]}</small></span><ChevronRight /></a>; })}</div></section>

      <section id="how" className="khet-section khet-how">
        <div className="khet-section-heading"><div><span className="khet-eyebrow">One connected wool journey</span><h2>Less uncertainty.<br />More bargaining power.</h2></div><p>Every record, service and sale comes together in one farmer-first workflow. Useful partners stay connected while farmers trade directly.</p></div>
        <div className="khet-steps">{journey.map(({ number, title, text, icon: Icon, href }) => <article key={number}><div><span>{number}</span><Icon /></div><h3>{title}</h3><p>{text}</p><a href={href}>Open workflow <ChevronRight /></a></article>)}</div>
      </section>

      <section id="platform" className="khet-platform">
        <div className="khet-platform-copy"><span className="khet-eyebrow light">Made for farmer ownership</span><h2>Your wool business,<br />all in one place.</h2><p>Register batches, add shearing photos, compare buyer offers, arrange pickup and show customers exactly where their fibre began.</p><a className="khet-primary" href="/dashboard">View farmer workspace <ArrowRight /></a><div className="khet-checks"><p><CheckCircle2 /> Keep ownership visible</p><p><CheckCircle2 /> Compare buyer prices and terms</p><p><CheckCircle2 /> Share the recorded batch history</p></div></div>
        <div className="khet-workspace-card"><div className="workspace-top"><div><span>SAMPLE BATCH</span><strong>WT-2610-KAR</strong></div><QrCode /></div><div className="workspace-quality"><span><small>Grade</small><b>B</b></span><span><small>Micron</small><b>32.8</b></span><span><small>Weight</small><b>126 kg</b></span></div><div className="workspace-offer"><div><small>Leading offer</small><strong>₹94<em>/kg</em></strong></div><span>7 sample bids</span></div><div className="workspace-route"><span className="done"><CheckCircle2 /></span><i /><span className="done"><BadgeCheck /></span><i /><span className="active"><HandCoins /></span><i /><span><Truck /></span></div><div className="workspace-labels"><span>Sheared</span><span>Graded</span><span>Auction</span><span>Pickup</span></div></div>
      </section>

      <section className="khet-section khet-capabilities">
        <div className="khet-section-heading"><div><span className="khet-eyebrow">Built around the batch</span><h2>Everything farmers need<br />to protect wool’s value.</h2></div><p>Operational tools stay simple on mobile, while each recorded update strengthens the public wool passport.</p></div>
        <div className="khet-cap-grid">{capabilities.map(([Icon, title, text, href]) => <a href={href} key={title}><Icon /><h3>{title}</h3><p>{text}</p><span>Use this tool <ArrowRight /></span></a>)}</div>
      </section>

      <section id="lifecycle" className="landing-lifecycle"><div className="khet-section-heading"><div><span className="khet-eyebrow">The complete wool lifecycle</span><h2>From sheep to shelf,<br />the source stays visible.</h2></div><p>When a batch becomes yarn, fabric or several finished products, every child lot continues to point back to the original farmer record.</p></div><div>{woolStages.map((stage, index) => { const Icon = stage.icon; return <article key={stage.key}><span>{String(index + 1).padStart(2, "0")}</span><Icon /><h3>{stage.title}</h3><p>{stage.detail}</p><small>{stage.owner}</small></article>; })}</div><Link className="khet-primary" href="/batch/WT-2610-KAR">Scan the sample journey <QrCode /></Link></section>

      <section id="trust" className="khet-trust">
        <div><span className="khet-eyebrow light">Recorded. Transparent. Accountable.</span><h2>A more dependable wool economy.</h2><p>Farmer identity, available laboratory results, buyer offers, logistics status and ownership milestones appear in one shared record.</p></div><div className="khet-trust-grid"><article><ShieldCheck /><strong>Account-linked events</strong><span>Each update shows which participant recorded it.</span></article><article><Warehouse /><strong>Visible custody</strong><span>Invited handlers add storage and transport records.</span></article><article><Globe2 /><strong>Public history</strong><span>Anyone can scan the QR without seeing private account details.</span></article></div>
      </section>

      <section className="landing-final-cta"><div><span className="khet-eyebrow light">Ready when shearing starts</span><h2>Create the first wool passport.</h2></div><div><Link className="khet-primary" href="/workspace/my-wool">Register wool <ArrowRight /></Link><Link href="/demo">Try your workspace <ChevronRight /></Link></div></section>

      <PastureScene/>
      <footer className="khet-footer"><div><a href="#home" className="khet-brand"><Mark /><strong>WoolTrace.</strong></a><p>Farm-to-product traceability and direct wool commerce for Indian farmers.</p></div><div><strong>PLATFORM</strong><a href="#how">How it works</a><a href="#lifecycle">Wool lifecycle</a><Link href="/labs">Karnataka lab outreach</Link></div><div><strong>ACCESS</strong><Link href="/login">Google sign-in</Link><Link href="/dashboard">My workspace</Link><Link href="/demo">Explore demos</Link><Link href="/batch/WT-2610-KAR">Sample passport</Link></div><div><strong>ABOUT YOUR DATA</strong><Link href="/privacy">Privacy notice</Link><Link href="/terms">Platform terms</Link><p>English interface</p></div><small>© 2026 WoolTrace · From sheep to shelf, clearly.</small></footer>
    </main>
  );
}
