"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, CheckCircle2, QrCode, ScanLine, X } from "lucide-react";
import type { PortalRole } from "@/app/lib/portals";

export default function PortalActions({ role, actions }: { role: PortalRole; actions: readonly string[] }) {
  const router = useRouter();
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopScanner() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }

  useEffect(() => () => stopScanner(), []);

  function openScannedValue(value: string) {
    let id = value.trim();
    try {
      const url = new URL(id);
      const match = url.pathname.match(/\/batch\/([^/]+)/);
      if (match) id = decodeURIComponent(match[1]);
    } catch { /* A printed batch ID is also valid input. */ }
    if (!id) return;
    stopScanner();
    setScanOpen(false);
    router.push(`/batch/${encodeURIComponent(id)}`);
  }

  async function startScanner() {
    setScanMessage("");
    const BarcodeReader = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (!BarcodeReader || !navigator.mediaDevices?.getUserMedia) {
      setScanMessage("Camera QR scanning is not supported in this browser. Enter the batch ID below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      setScanning(true);
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      const detector = new BarcodeReader({ formats: ["qr_code"] });
      const scanFrame = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) { openScannedValue(codes[0].rawValue); return; }
        } catch { /* Keep scanning while the camera is warming up. */ }
        window.requestAnimationFrame(() => void scanFrame());
      };
      void scanFrame();
    } catch {
      stopScanner();
      setScanMessage("Camera access was unavailable. Allow camera permission or enter the batch ID below.");
    }
  }

  function openPassport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = String(data.get("batchId") ?? "").trim();
    if (id) openScannedValue(id);
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
    {scanOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="scan-title"><form className="portal-modal" onSubmit={openPassport}><button type="button" aria-label="Close QR scanner" className="modal-close" onClick={() => { stopScanner(); setScanOpen(false); }}><X /></button><QrCode /><p className="kicker">OPEN WOOL PASSPORT</p><h2 id="scan-title">Scan QR or enter its batch ID</h2><p>Use the rear camera or type the code printed below the label.</p><video className={`qr-camera ${scanning ? "active" : ""}`} ref={videoRef} muted playsInline aria-label="QR scanner camera preview" /><button className="camera-button" type="button" onClick={() => scanning ? stopScanner() : void startScanner()}><Camera /> {scanning ? "Stop camera" : "Scan with camera"}</button>{scanMessage && <p className="form-error">{scanMessage}</p>}<label>Batch ID<input name="batchId" defaultValue="WT-2408-KAS" required /></label><button className="lime-button" type="submit">Open passport <ArrowRight /></button></form></div>}
    {selected && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="event-title"><form className="portal-modal" onSubmit={saveEvent}><button type="button" aria-label="Close batch update" className="modal-close" onClick={() => setSelected("")}><X /></button><p className="kicker">SIGNED PORTAL UPDATE</p><h2 id="event-title">{selected}</h2><p>This update will become part of the batch’s public chain of custody.</p><label>Live batch ID<input name="batchId" required placeholder="WT-2609-ABCDE" /></label><label>Location<input name="location" placeholder="Facility, village or district" /></label><label>Notes<textarea name="notes" placeholder="Weight, seal number, test reference or other proof" /></label>{message && <p className={message.startsWith("Saved") ? "form-success" : "form-error"}>{message}</p>}<button className="lime-button" type="submit" disabled={saving}>{saving ? "Saving update…" : "Save to QR passport"} {saving ? null : <CheckCircle2 />}</button></form></div>}
  </>;
}
