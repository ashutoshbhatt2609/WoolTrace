"use client";

import { Download, Share2 } from "lucide-react";
import { useState } from "react";

export default function PassportActions({ batchId }: { batchId: string }) {
  const [shared, setShared] = useState(false);
  async function share() {
    const data = { title: `WoolTrace ${batchId}`, text: `Verified wool passport ${batchId}`, url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else { await navigator.clipboard.writeText(window.location.href); setShared(true); }
  }
  return <div className="passport-actions"><button className="passport-button" onClick={() => window.print()}><Download /> Print or save QR passport</button><button className="passport-button" onClick={share}><Share2 /> {shared ? "Link copied" : "Share passport"}</button></div>;
}
