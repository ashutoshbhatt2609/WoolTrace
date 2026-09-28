"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, QrCode, ScanLine, X } from "lucide-react";
import type { PortalRole } from "@/app/lib/portals";

export default function PortalActions({ role, actions }: { role: PortalRole; actions: readonly string[] }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function openPassport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = String(data.get("batchId") ?? "").trim();
    if (id) window.location.assign(`/batch/${encodeURIComponent(id)}`);
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/batches/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batchId: data.get("batchId"), portalRole: role, title: selected, location: data.get("location"), notes: data.get("notes") }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "The update could not be saved.");
      setMessage("Saved to the batch passport. Anyone scanning its QR can now see this stage.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The update could not be saved."); }
    finally { setSaving(false); }
  }

  return <><div className="portal-actions-wrap">
    <button className="portal-scan-button" onClick={() => setScanOpen(true)}><ScanLine /> Scan or enter batch QR</button>
    <article className="portal-action-panel"><div className="panel-head"><div><p className="kicker">YOUR WORKFLOW</p><h3>Actions for this stage</h3></div></div>{actions.map((action, index) => <button onClick={() => { setSelected(action); setMessage(""); }} key={action}><span>{index + 1}</span><p><strong>{action}</strong><small>Record this update against a live batch</small></p><ArrowRight /></button>)}</article>
    </div>
    {scanOpen && <div className="modal-backdrop"><form className="portal-modal" onSubmit={openPassport}><button type="button" className="modal-close" onClick={() => setScanOpen(false)}><X /></button><QrCode /><p className="kicker">OPEN WOOL PASSPORT</p><h2>Scan result or batch ID</h2><p>Enter the code printed below the QR label.</p><label>Batch ID<input name="batchId" defaultValue="WT-2408-KAS" required /></label><button className="lime-button" type="submit">Open passport <ArrowRight /></button></form></div>}
    {selected && <div className="modal-backdrop"><form className="portal-modal" onSubmit={saveEvent}><button type="button" className="modal-close" onClick={() => setSelected("")}><X /></button><p className="kicker">SIGNED PORTAL UPDATE</p><h2>{selected}</h2><p>This update will become part of the batch’s public chain of custody.</p><label>Live batch ID<input name="batchId" required placeholder="WT-2609-ABCDE" /></label><label>Location<input name="location" placeholder="Facility, village or district" /></label><label>Notes<textarea name="notes" placeholder="Weight, seal number, test reference or other proof" /></label>{message && <p className={message.startsWith("Saved") ? "form-success" : "form-error"}>{message}</p>}<button className="lime-button" type="submit" disabled={saving}>{saving ? "Saving update…" : "Save to QR passport"} {saving ? null : <CheckCircle2 />}</button></form></div>}
  </>;
}
