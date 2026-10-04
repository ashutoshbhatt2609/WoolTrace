import Link from "next/link";
import { ArrowLeft, ExternalLink, FlaskConical, Mail, MapPin, Phone, Sprout } from "lucide-react";

const leads = [
  {
    type: "Textile testing laboratory",
    name: "Textiles Committee — Regional Laboratory, Bengaluru",
    address: "1st Floor, FKCCI WTC Building, K. G. Road, Bengaluru 560009",
    phone: "+91 98868 40289",
    phoneHref: "+919886840289",
    email: "blr.tc@nic.in",
    source: "BIS laboratory directory",
    sourceUrl: "https://lims.bis.gov.in/home/empaneled_labs/?page=3",
  },
  {
    type: "Sheep and wool organisation",
    name: "Karnataka Sheep and Wool Development Corporation",
    address: "Hebbal, Bengaluru 560024",
    phone: "080 2341 4295",
    phoneHref: "+918023414295",
    email: "kswdcl@gmail.com",
    source: "Organisation website",
    sourceUrl: "https://kswdcscheme.in/",
  },
  {
    type: "Government outreach contact",
    name: "Animal Husbandry & Veterinary Services, Bengaluru Urban",
    address: "Bengaluru Urban district, Karnataka",
    phone: "080 2341 8327",
    phoneHref: "+918023418327",
    email: "",
    source: "Bengaluru Urban district portal",
    sourceUrl: "https://bengaluruurban.nic.in/en/animal-husbandry/",
  },
] as const;

export default function KarnatakaLabsPage() {
  return <main className="labs-page">
    <header className="labs-nav"><Link href="/" className="portal-brand"><span className="brand-mark"><Sprout /></span> WoolTrace</Link><Link href="/dashboard"><ArrowLeft /> Dashboard</Link></header>
    <section className="labs-hero"><div><p className="kicker">KARNATAKA OUTREACH DIRECTORY</p><h1>Potential wool testing and sector contacts</h1><p>Public leads farmers and the WoolTrace team can contact about fibre testing, sheep-and-wool programmes and future partnerships.</p></div><span><FlaskConical /> 3 public leads</span></section>
    <aside className="labs-notice"><strong>Not WoolTrace partners yet.</strong> These organisations are shown for outreach only. Inclusion does not mean onboarding, endorsement, availability or approval of any wool batch.</aside>
    <section className="labs-layout">
      <div className="labs-list">{leads.map((lead) => <article key={lead.name}><p className="kicker">{lead.type.toUpperCase()}</p><h2>{lead.name}</h2><p><MapPin /> {lead.address}</p><div><a href={`tel:${lead.phoneHref}`}><Phone /> {lead.phone}</a>{lead.email && <a href={`mailto:${lead.email}`}><Mail /> {lead.email}</a>}</div><a className="labs-source" href={lead.sourceUrl} target="_blank" rel="noreferrer">Check official/public source: {lead.source} <ExternalLink /></a></article>)}</div>
      <aside className="labs-map"><iframe title="Map showing the Bengaluru laboratory area" src="https://www.openstreetmap.org/export/embed.html?bbox=77.56%2C12.95%2C77.62%2C13.02&layer=mapnik&marker=12.9745%2C77.5805" loading="lazy" /><div><MapPin /><p><strong>Bengaluru testing lead</strong><small>OpenStreetMap location near K. G. Road. Confirm the address with the organisation before travelling.</small></p></div></aside>
    </section>
  </main>;
}
