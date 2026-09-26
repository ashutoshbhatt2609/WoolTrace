"use client";

import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesCombined,
  ChevronDown,
  HandCoins,
  Languages,
  Menu,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Sprout,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const stats = [
  { value: "1 QR", label: "Complete batch identity", icon: ScanLine },
  { value: "6 stages", label: "Farm-to-fabric journey", icon: PackageCheck },
  { value: "100%", label: "Auditable hand-offs", icon: ShieldCheck },
  { value: "₹ direct", label: "Competitive buyer offers", icon: HandCoins },
];

const services = [
  {
    title: "Batch traceability",
    text: "Create a permanent digital identity at shearing and keep every quality, ownership and processing event connected.",
    image: "https://images.pexels.com/photos/5490730/pexels-photo-5490730.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Farm workers shearing a sheep in a working barn",
    caption: "Shearing recorded at source",
  },
  {
    title: "Direct buyer offers",
    text: "Invite verified buyers to compete for a batch, compare real net earnings and accept only the terms that work.",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/CSIRO_ScienceImage_2403_Classifying_Wool.jpg?width=1600",
    alt: "Wool fibres being sorted and graded by hand",
    caption: "Quality checked before sale",
  },
  {
    title: "Farmer support network",
    text: "Find assessors, transporters, warehouses and processors without losing sight of the batch or the farmer.",
    image: "https://images.unsplash.com/photo-1759738099669-d64b0656f6cf?auto=format&fit=crop&w=1600&q=82",
    alt: "Textile workers weaving fabric on a traditional loom in Assam",
    caption: "Processing linked to the batch",
  },
];

const steps = [
  {
    title: "Register the shearing",
    text: "The farmer records the farm, flock, breed, shearing date and initial weight. WoolTrace creates the batch ID and QR label.",
  },
  {
    title: "Verify quality and ownership",
    text: "Assessment results, grade and certificates attach to the batch. Ownership and custody remain separate and visible.",
  },
  {
    title: "Receive competitive offers",
    text: "Verified buyers submit offers. The farmer compares price, pickup, deductions and buyer reliability before deciding.",
  },
  {
    title: "Follow every transformation",
    text: "Transport, storage, processing and derived yarn or fabric stay linked to the original source batch.",
  },
];

const benefits = [
  { icon: ChartNoAxesCombined, label: "Clear market intelligence" },
  { icon: HandCoins, label: "Farmer-controlled selling" },
  { icon: BadgeCheck, label: "Verified quality records" },
  { icon: Languages, label: "Local-language access" },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Sprout className="size-4" strokeWidth={2.6} />
    </span>
  );
}

function LoginDialog() {
  return (
    <Button asChild className="login-button">
      <a href="/login">Log in <ArrowRight className="size-3.5" /></a>
    </Button>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="site-canvas">
      <div className="site-frame">
        <section id="home" className="hero-wrap">
          <header className="topbar">
            <a href="#home" className="brand" aria-label="WoolTrace home"><BrandMark /><span>WoolTrace</span></a>
            <nav className="nav-pill" aria-label="Main navigation">
              <a href="#home" className="active">Home</a>
              <a href="#services">Services</a>
              <a href="#journey">Journey</a>
              <a href="#farmers">Farmers</a>
            </nav>
            <div className="hidden sm:block"><LoginDialog /></div>
            <button type="button" className="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </header>

          {menuOpen && (
            <nav className="mobile-nav" aria-label="Mobile navigation">
              <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
              <a href="#journey" onClick={() => setMenuOpen(false)}>Journey</a>
              <a href="#farmers" onClick={() => setMenuOpen(false)}>Farmers</a>
              <div className="sm:hidden"><LoginDialog /></div>
            </nav>
          )}

          <div className="hero-media">
            <Image src="/wooltrace-hero.png" alt="Indian wool farmer holding freshly shorn wool beside a flock of sheep" fill priority sizes="(max-width: 1280px) 94vw, 1180px" className="object-cover" />
            <div className="hero-overlay" aria-hidden="true" />
            <div className="hero-content">
              <p className="hero-eyebrow"><span /> Farmer-first traceability</p>
              <h1>Every fibre tells<br />the farmer&apos;s story</h1>
              <p>Track wool from shearing to fabric, prove its quality and let verified buyers compete directly for every batch.</p>
              <Button asChild className="hero-cta"><a href="#journey">See the full journey <ArrowRight className="size-4" /></a></Button>
            </div>
            <div className="hero-badge"><BadgeCheck className="size-4" /><span>Batch history verified</span></div>
          </div>
        </section>

        <section className="section-block trust-section">
          <div className="section-heading left-heading">
            <p className="kicker">One connected platform</p>
            <h2>Built for trust at every hand-off</h2>
            <p>Farmers keep control while buyers and partners work from the same verified batch record.</p>
          </div>
          <div className="stats-grid">
            {stats.map(({ value, label, icon: Icon }) => (
              <article key={label} className="stat-card"><Icon className="size-5" /><div><strong>{value}</strong><span>{label}</span></div></article>
            ))}
          </div>
        </section>

        <section id="services" className="section-block">
          <div className="section-heading left-heading">
            <p className="kicker">Farmer services</p>
            <h2>Useful tools, not extra paperwork</h2>
            <p>Simple mobile-first workflows help farmers protect their wool&apos;s value and reach the right people.</p>
          </div>
          <div className="service-grid">
            {services.map(({ title, text, image, alt, caption }, index) => (
              <article key={title} className="service-card">
                <div className="service-visual">
                  <img className="section-photo" src={image} alt={alt} loading="lazy" />
                  <span className="image-caption">{caption}</span>
                </div>
                <div className="service-copy"><div className="service-number">0{index + 1}</div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section id="journey" className="section-block journey-section">
          <div className="section-heading left-heading">
            <p className="kicker">The wool lifecycle</p>
            <h2>From shearing to finished fabric</h2>
            <p>Each stage adds a clear, time-stamped record to one permanent batch passport.</p>
          </div>
          <div className="journey-layout">
            <div className="journey-image">
              <img className="section-photo" src="https://images.pexels.com/photos/15884856/pexels-photo-15884856.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="A flock of wool sheep gathered on a working farm" loading="lazy" />
              <div className="journey-chip"><ScanLine className="size-5" /><div><strong>WT-2408</strong><span>Scan-ready batch</span></div></div>
            </div>
            <div className="step-list">
              {steps.map((step, index) => (
                <article key={step.title} className={`step-item ${activeStep === index ? "open" : ""}`}>
                  <button type="button" onClick={() => setActiveStep(index)} aria-expanded={activeStep === index}>
                    <span className="step-count">{index + 1}</span><span>{step.title}</span><ChevronDown className="size-4" />
                  </button>
                  {activeStep === index && <p>{step.text}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="benefit-band">
          <div className="section-heading left-heading compact">
            <p className="kicker">Why farmers use WoolTrace</p>
            <h2>Better information. Stronger decisions.</h2>
          </div>
          <div className="benefit-grid">
            {benefits.map(({ icon: Icon, label }) => (<div key={label} className="benefit-item"><Icon className="size-7" /><span>{label}</span></div>))}
          </div>
        </section>

        <section id="farmers" className="section-block farmer-stories">
          <div className="section-heading left-heading">
            <p className="kicker">Designed around real farmers</p>
            <h2>The farmer stays in control</h2>
            <p>WoolTrace does not remove useful services. It makes every service, deduction and hand-off visible.</p>
          </div>
          <div className="story-grid">
            <article className="quote-card">
              <div className="farmer-avatar"><img className="section-photo" src="https://images.pexels.com/photos/5933416/pexels-photo-5933416.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Indian farmer standing outdoors" loading="lazy" /></div>
              <div><p className="quote">“I can show where my wool came from, compare buyer terms and decide when the offer is right.”</p><strong>Farmer journey</strong><span>Shearing → quality → direct sale</span></div>
            </article>
            <article className="offer-card">
              <div className="offer-top"><div><span>Live buyer offers</span><strong>Batch WT-2408</strong></div><span className="offer-status">3 verified</span></div>
              {[["GreenWeave Mills", "₹62,800", true], ["Kaveri Textiles", "₹61,900", false], ["Natural Loom Co.", "₹60,750", false]].map(([buyer, amount, best]) => (
                <div className={`offer-row ${best ? "best" : ""}`} key={String(buyer)}><div><strong>{String(buyer)}</strong><span>{best ? "Pickup included · best net value" : "Verified buyer offer"}</span></div><b>{String(amount)}</b></div>
              ))}
            </article>
          </div>
        </section>

        <section className="qr-section">
          <div>
            <p className="kicker light">The public wool passport</p>
            <h2>Scan once. See the whole life.</h2>
            <p>No app required. A phone camera opens the origin, quality certificate, sale, transport, storage and processing trail—without exposing private farmer data.</p>
          </div>
          <div className="qr-card">
            <div className="fake-qr" aria-hidden="true"><span /><span /><span /><ScanLine className="size-10" /></div>
            <div><span>Verified wool batch</span><strong>WT-2408</strong><p>Koppal, Karnataka · Fine grade A</p></div>
            <BadgeCheck className="size-7" />
          </div>
        </section>

        <section className="cta-panel">
          <img className="section-photo" src="https://images.pexels.com/photos/5660232/pexels-photo-5660232.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Hands holding a skein of natural wool yarn" loading="lazy" />
          <div className="cta-overlay" aria-hidden="true" />
          <div className="cta-content"><p className="kicker light">A clearer wool economy</p><h2>Grow with WoolTrace</h2><p>Give every batch a history, every farmer a stronger voice and every buyer proof they can trust.</p><Button asChild><a href="#home">Start with the journey <ArrowRight className="size-4" /></a></Button></div>
        </section>

        <footer className="footer">
          <div className="footer-brand"><div className="brand"><BrandMark /><span>WoolTrace</span></div><p>From farm to fabric, clearly.</p></div>
          <div className="footer-links"><div><strong>Explore</strong><a href="#services">Services</a><a href="#journey">Journey</a></div><div><strong>Platform</strong><a href="#farmers">For farmers</a><a href="#home">Log in</a></div></div>
          <div className="photo-sources" aria-label="Photography credits">
            <span>Photography:</span>
            <a href="https://www.pexels.com/photo/focused-farmers-shearing-sheep-in-barn-5490730/" target="_blank" rel="noreferrer">Rachel Claire</a>
            <a href="https://commons.wikimedia.org/wiki/File:CSIRO_ScienceImage_2403_Classifying_Wool.jpg" target="_blank" rel="noreferrer">CSIRO</a>
            <a href="https://unsplash.com/photos/people-weaving-fabric-on-a-loom-in-a-rustic-setting-lfB03HDIdOs" target="_blank" rel="noreferrer">Rohit Dey</a>
            <a href="https://www.pexels.com/photo/sheep-on-farm-15884856/" target="_blank" rel="noreferrer">Orhan Akbaba</a>
            <a href="https://www.pexels.com/photo/indian-farmer-with-mustache-5933416/" target="_blank" rel="noreferrer">Mohan Nannapaneni</a>
          </div>
          <p className="copyright">© 2026 WoolTrace</p>
        </footer>
      </div>
    </main>
  );
}
