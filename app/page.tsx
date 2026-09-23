"use client";

import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Factory,
  HandCoins,
  HeartHandshake,
  Languages,
  MapPin,
  Menu,
  PackageCheck,
  ScanLine,
  Scissors,
  ShieldCheck,
  Sparkles,
  Sprout,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const journey = [
  { label: "Sheared", detail: "Farm & flock", icon: Scissors },
  { label: "Assessed", detail: "Grade & quality", icon: BadgeCheck },
  { label: "Sold", detail: "Best buyer offer", icon: HandCoins },
  { label: "Moved", detail: "Live custody trail", icon: Truck },
  { label: "Stored", detail: "Verified warehouse", icon: Warehouse },
  { label: "Crafted", detail: "Yarn to fabric", icon: Factory },
];

const farmerFeatures = [
  {
    icon: HandCoins,
    title: "Better prices, directly",
    text: "Verified buyers compete for your batch. Compare the real amount you will receive before accepting.",
    tone: "mint",
  },
  {
    icon: ScanLine,
    title: "A digital identity for every batch",
    text: "One QR keeps your farm, shearing, quality, sale, transport and processing story together.",
    tone: "butter",
  },
  {
    icon: HeartHandshake,
    title: "Trusted services nearby",
    text: "Find assessors, shearers, vets, transporters, warehouses and processors in one place.",
    tone: "blue",
  },
  {
    icon: Languages,
    title: "Made for everyday use",
    text: "Simple steps, local-language support and mobile-friendly tools help farmers stay in control.",
    tone: "rose",
  },
];

function WoolMark({ small = false }: { small?: boolean }) {
  return (
    <span aria-hidden="true" className={`wool-mark ${small ? "h-9 w-9" : "h-11 w-11"}`}>
      <span />
      <span />
      <span />
      <Sprout className={small ? "size-4" : "size-5"} strokeWidth={2.2} />
    </span>
  );
}

function LoginDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 rounded-full border-[#1f4b36]/20 bg-white px-5 text-[0.95rem] font-semibold text-[#173f2c] shadow-none hover:bg-[#edf7ef]">
          Log in <ArrowRight className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[#dbe8dc] bg-[#fffdf8] p-7 sm:max-w-md sm:rounded-[1.75rem]">
        <DialogHeader>
          <div className="mb-3 flex items-center gap-3"><WoolMark small /><span className="font-display text-xl font-bold text-[#173f2c]">WoolTrace</span></div>
          <DialogTitle className="font-display text-3xl leading-tight text-[#173f2c]">Welcome back</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-[#647368]">Enter your registered mobile number to continue to your account.</DialogDescription>
        </DialogHeader>
        <form className="mt-2 space-y-5" onSubmit={(event) => event.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-[#264c37]">Mobile number</Label>
            <Input id="mobile" inputMode="tel" placeholder="+91 98765 43210" className="h-12 rounded-xl border-[#cadbcd] bg-white text-base" />
          </div>
          <Button className="h-12 w-full rounded-xl bg-[#1e5a3c] text-base hover:bg-[#16472f]">Continue with OTP <ArrowRight className="size-4" /></Button>
          <p className="text-center text-sm leading-relaxed text-[#738078]">New to WoolTrace? Registration will open with the full farmer platform.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfbf4] text-[#173f2c]">
      <header className="relative z-40 border-b border-[#1f4b36]/10 bg-[#fbfbf4]/95 backdrop-blur-md">
        <div className="page-shell flex h-[78px] items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="WoolTrace home">
            <WoolMark small />
            <span className="font-display text-[1.35rem] font-bold tracking-[-0.03em]">WoolTrace</span>
          </a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            <a className="nav-link" href="#journey">How it works</a>
            <a className="nav-link" href="#farmers">For farmers</a>
            <a className="nav-link" href="#traceability">Traceability</a>
            <a className="nav-link" href="#bidding">Buyer offers</a>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><LoginDialog /></div>
            <button type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)} className="grid size-11 place-items-center rounded-full border border-[#1f4b36]/15 bg-white text-[#173f2c] lg:hidden">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="page-shell pb-5 lg:hidden">
            <nav className="grid gap-1 rounded-2xl border border-[#dce9dd] bg-white p-3 shadow-[0_18px_50px_rgba(31,75,54,0.1)]">
              {[["How it works", "#journey"], ["For farmers", "#farmers"], ["Traceability", "#traceability"], ["Buyer offers", "#bidding"]].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 font-medium hover:bg-[#edf7ef]">{label}<ChevronRight className="size-4" /></a>
              ))}
              <div className="mt-2 sm:hidden"><LoginDialog /></div>
            </nav>
          </div>
        )}
      </header>

      <section id="top" className="relative pb-16 pt-10 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20">
        <div className="hero-orb hero-orb-left" aria-hidden="true" />
        <div className="hero-orb hero-orb-right" aria-hidden="true" />
        <div className="page-shell relative grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="max-w-2xl">
            <div className="eyebrow"><Sparkles className="size-4" />Every fibre has a story</div>
            <h1 className="font-display mt-6 text-[clamp(3.25rem,7vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-[#153e2b]">From the flock<span className="block text-[#4f8b5f]">to the fabric.</span></h1>
            <p className="mt-7 max-w-xl text-[1.08rem] leading-8 text-[#5d7063] sm:text-xl">Give every wool batch a trusted digital life. Farmers earn with confidence, buyers see the full journey, and one QR keeps every hand-off connected.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-13 rounded-full bg-[#1d5b3c] px-7 text-base font-semibold hover:bg-[#16482f]"><a href="#journey">Explore the journey <ArrowRight className="size-4" /></a></Button>
              <Button asChild variant="outline" className="h-13 rounded-full border-[#1d5b3c]/20 bg-transparent px-7 text-base font-semibold text-[#1d5b3c] hover:bg-white"><a href="#farmers">See farmer benefits</a></Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#496052]">
              {["Verified batch history", "Direct buyer offers", "Farmer-first tools"].map((item) => (
                <span key={item} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-[#dff0df] text-[#246044]"><Check className="size-3" strokeWidth={3} /></span>{item}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[680px] lg:mx-0">
            <div className="hero-photo-shell">
              <Image src="/wooltrace-hero.png" alt="An Indian wool farmer standing with sheep and freshly shorn wool in a green field" fill priority sizes="(max-width: 1024px) 92vw, 52vw" className="object-cover" />
              <div className="photo-shade" aria-hidden="true" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-7 sm:left-7 sm:right-7">
                <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">Origin verified</p><p className="font-display mt-1 text-2xl font-semibold sm:text-3xl">Karnataka, India</p></div>
                <div className="grid size-11 shrink-0 place-items-center rounded-full border border-white/40 bg-white/15 backdrop-blur-md"><MapPin className="size-5" /></div>
              </div>
            </div>
            <div className="trace-card">
              <div className="grid size-12 place-items-center rounded-2xl bg-[#e9f6e9] text-[#1e5a3c]"><ScanLine className="size-6" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3"><p className="font-display text-lg font-bold">Batch WT-2408</p><span className="rounded-full bg-[#e8f5e9] px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-[#236144]">Verified</span></div>
                <p className="mt-1 text-sm text-[#68766c]">Sheared 14 Aug · Quality A</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4ebe4]"><div className="h-full w-[72%] rounded-full bg-[#4d9363]" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="bg-[#173f2c] py-20 text-white sm:py-24">
        <div className="page-shell">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div><p className="section-kicker section-kicker-light">One scan. The whole life.</p><h2 className="section-title mt-4 max-w-lg text-white">Follow wool through every trusted hand.</h2></div>
            <p className="max-w-xl text-lg leading-8 text-[#c6d8ca] lg:justify-self-end">Each update becomes part of a clear digital trail—from the day it was sheared to the moment it becomes yarn or fabric.</p>
          </div>
          <div className="journey-grid mt-12">
            {journey.map(({ label, detail, icon: Icon }, index) => (
              <div key={label} className="journey-step">
                <div className="mb-9 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-[#d8efcf] text-[#1b5338]"><Icon className="size-5" /></span>{index < journey.length - 1 && <span className="journey-line" aria-hidden="true" />}</div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8fb59b]">0{index + 1}</p><h3 className="font-display mt-2 text-2xl font-semibold">{label}</h3><p className="mt-1 text-sm text-[#b8ccbc]">{detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f2c96d] text-[#173f2c]"><ShieldCheck className="size-6" /></div><div><p className="font-display text-xl font-semibold">Nothing gets lost between stages</p><p className="mt-1 text-[#b9cdbd]">Ownership, custody, quality and processing records stay connected.</p></div></div>
            <Button asChild variant="outline" className="rounded-full border-white/20 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"><a href="#traceability">See what a scan reveals <ArrowRight className="size-4" /></a></Button>
          </div>
        </div>
      </section>

      <section id="farmers" className="py-20 sm:py-28">
        <div className="page-shell">
          <div className="mx-auto max-w-3xl text-center"><p className="section-kicker">Built around the farmer</p><h2 className="section-title mt-4">More control at every step.</h2><p className="section-copy mx-auto mt-5 max-w-2xl">WoolTrace brings information, trusted services and serious buyers together—so a farmer can make the decision, not chase it.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {farmerFeatures.map(({ icon: Icon, title, text, tone }) => (
              <article key={title} className={`feature-card feature-card-${tone}`}><div className="feature-icon"><Icon className="size-6" /></div><div><h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">{title}</h3><p className="mt-3 max-w-lg leading-7 text-[#597063]">{text}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section id="traceability" className="pb-20 sm:pb-28">
        <div className="page-shell">
          <div className="trace-panel grid overflow-hidden rounded-[2rem] lg:grid-cols-[0.88fr_1.12fr]">
            <div className="bg-[#dcefd8] p-7 sm:p-12 lg:p-14">
              <div className="grid size-13 place-items-center rounded-2xl bg-white text-[#1d5b3c] shadow-[0_8px_30px_rgba(36,93,60,0.12)]"><ScanLine className="size-7" /></div>
              <p className="section-kicker mt-8">The QR passport</p><h2 className="section-title mt-4">A batch story anyone can trust.</h2><p className="section-copy mt-5">Scan with any phone camera. No app needed. Private details stay protected while verified history remains clear.</p>
              <ul className="mt-8 space-y-4">
                {["Farm, flock and shearing details", "Quality grade and certificate", "Sale, transport and storage trail", "Processing links through to fabric"].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium text-[#31533e]"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[#277047]"><Check className="size-3.5" strokeWidth={3} /></span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center bg-[#f1e9d4] p-6 sm:p-10 lg:p-14">
              <div className="w-full rounded-[1.65rem] border border-[#cbd9c7] bg-[#fffdf8] p-5 shadow-[0_24px_70px_rgba(31,75,54,0.12)] sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e3e8df] pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#719078]">Wool passport</p><h3 className="font-display mt-1 text-2xl font-bold">Batch WT-2408</h3></div><span className="flex items-center gap-2 rounded-full bg-[#e2f3e3] px-3 py-1.5 text-xs font-bold text-[#246044]"><BadgeCheck className="size-4" /> Fully verified</span></div>
                <div className="grid gap-4 py-5 sm:grid-cols-3">{[["Origin", "Koppal, Karnataka"], ["Breed", "Deccani sheep"], ["Grade", "Fine · A"]].map(([label, value]) => (<div key={label} className="rounded-2xl bg-[#f2f5ed] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#7a887d]">{label}</p><p className="mt-1 text-sm font-bold text-[#284936]">{value}</p></div>))}</div>
                <div className="space-y-0">
                  {[["14 Aug", "Wool sheared", "Producer verified"], ["16 Aug", "Quality assessed", "Certificate QA-894"], ["21 Aug", "Buyer offer accepted", "Direct farm sale"], ["22 Aug", "Pickup confirmed", "Transport seal intact"]].map(([date, event, meta], index) => (
                    <div key={event} className="grid grid-cols-[66px_18px_1fr] gap-3"><p className="pt-4 text-xs font-semibold text-[#7c8a80]">{date}</p><div className="flex flex-col items-center"><span className="mt-[1.15rem] size-2.5 rounded-full border-2 border-[#e8f4e6] bg-[#398057]" />{index < 3 && <span className="h-full w-px bg-[#d7e2d6]" />}</div><div className="border-b border-[#e9ece6] py-3.5 last:border-0"><p className="font-semibold text-[#244834]">{event}</p><p className="mt-0.5 text-xs text-[#7a887e]">{meta}</p></div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="bidding" className="bg-[#eaf3e6] py-20 sm:py-28">
        <div className="page-shell grid items-center gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-20">
          <div><p className="section-kicker">Direct competitive selling</p><h2 className="section-title mt-4 max-w-2xl">More buyers. Clearer terms. The farmer chooses.</h2><p className="section-copy mt-5 max-w-xl">Publish one verified batch and receive competing offers directly. Compare price, pickup, deductions and buyer reliability—not just a headline number.</p><div className="mt-8 flex flex-wrap gap-3">{["Set a minimum price", "Reject every offer", "See estimated net earnings"].map((item) => (<span key={item} className="rounded-full border border-[#bcd4bd] bg-white/60 px-4 py-2 text-sm font-semibold text-[#315b40]">{item}</span>))}</div></div>
          <div className="rounded-[2rem] bg-[#173f2c] p-5 text-white shadow-[0_30px_80px_rgba(23,63,44,0.18)] sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#96bda1]">Open buyer offers</p><p className="font-display mt-1 text-2xl font-semibold">Batch WT-2408</p></div><span className="rounded-full bg-[#f3cb70] px-3 py-1.5 text-xs font-bold text-[#173f2c]">Closes in 5h</span></div>
            <div className="mt-5 space-y-3">
              {[["GreenWeave Mills", "₹62,800", "Pickup included", "Best value"], ["Kaveri Textiles", "₹61,900", "Payment in 2 days", ""], ["Natural Loom Co.", "₹60,750", "Pickup tomorrow", ""]].map(([buyer, amount, terms, badge], index) => (
                <div key={buyer} className={`rounded-2xl border p-4 ${index === 0 ? "border-[#99c99f] bg-white text-[#173f2c]" : "border-white/10 bg-white/[0.05]"}`}><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{buyer}</p><p className={`mt-1 text-xs ${index === 0 ? "text-[#6a786e]" : "text-[#adc5b3]"}`}>{terms}</p></div><div className="text-right"><p className="font-display text-xl font-bold">{amount}</p>{badge && <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-[#2d7a4b]">{badge}</p>}</div></div></div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#d9edcf] p-4 text-[#173f2c]"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#5c7d64]">Estimated farmer earnings</p><p className="font-display mt-1 text-2xl font-bold">₹60,950</p></div><PackageCheck className="size-7 text-[#2b7049]" /></div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="page-shell"><div className="cta-panel relative overflow-hidden rounded-[2.25rem] bg-[#f3cc74] px-7 py-12 text-center sm:px-12 sm:py-16"><div className="cta-ring cta-ring-one" aria-hidden="true" /><div className="cta-ring cta-ring-two" aria-hidden="true" /><div className="relative mx-auto max-w-3xl"><WoolMark /><h2 className="font-display mt-6 text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em]">Let every batch carry the farmer&apos;s story.</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#4d5e45]">WoolTrace is building a clearer, fairer path from rural producers to the people who value their wool.</p><Button asChild className="mt-8 h-12 rounded-full bg-[#173f2c] px-7 text-base hover:bg-[#0f3021]"><a href="#top">Return to the top <ArrowRight className="size-4" /></a></Button></div></div></div>
      </section>

      <footer className="border-t border-[#1f4b36]/10 bg-[#f3f6ed] py-10">
        <div className="page-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><WoolMark small /><div><p className="font-display text-lg font-bold">WoolTrace</p><p className="text-sm text-[#708076]">From farm to fabric, clearly.</p></div></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#53685a]"><a href="#journey" className="hover:text-[#173f2c]">How it works</a><a href="#farmers" className="hover:text-[#173f2c]">For farmers</a><a href="#traceability" className="hover:text-[#173f2c]">Traceability</a><a href="#bidding" className="hover:text-[#173f2c]">Buyer offers</a></div></div>
      </footer>
    </main>
  );
}
