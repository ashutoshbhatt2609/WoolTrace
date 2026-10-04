"use client";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { portalDefinitions, portalRoles, isPortalRole } from "@/app/lib/portals";
import { requestJson } from "@/app/components/forms";
export default function RoleSwitcher({ role, demo }: { role: string; demo: boolean }) {
  const router = useRouter(), pathname = usePathname(), [pending, startTransition] = useTransition(), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function switchRole(next: string) {
    if (!isPortalRole(next) || next === role || busy || pending) return;
    setBusy(true); setError("");
    try {
      if (!demo) await requestJson("/api/profile/role", { method: "PATCH", body: JSON.stringify({ role: next }) });
      startTransition(() => {
        if (demo) router.push("/demo/" + next);
        else if (pathname === "/dashboard") router.refresh();
        else router.push("/dashboard");
      });
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <div className="wt-switcher"><label><span>{demo ? "Demo workspace" : "Working as"}</span><select aria-label="Switch workspace role" value={role} disabled={busy || pending} onChange={e => void switchRole(e.target.value)}>{portalRoles.map(r => <option key={r} value={r}>{portalDefinitions[r].short}</option>)}</select></label><small aria-live="polite">{busy || pending ? "Opening workspace…" : demo ? "Sample records only" : "Same account · your records stay saved"}</small>{error && <p role="alert" className="wt-error">{error}</p>}</div>;
}
