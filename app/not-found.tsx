import Link from "next/link";
import { ArrowLeft, QrCode, Sprout } from "lucide-react";

export default function NotFound() {
  return <main className="not-found-page">
    <Link href="/" className="portal-brand"><span className="brand-mark"><Sprout /></span> WoolTrace</Link>
    <section><span><QrCode /></span><p className="kicker">RECORD NOT FOUND</p><h1>This wool passport does not exist.</h1><p>Check the batch ID printed below the QR label, or return to the traceability workspace and try again.</p><div><Link className="lime-button" href="/workspace/traceability">Try another batch ID</Link><Link href="/"><ArrowLeft /> Back to WoolTrace</Link></div></section>
  </main>;
}
