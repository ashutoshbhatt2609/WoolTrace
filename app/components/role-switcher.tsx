"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronDown, LogOut, UserRound } from "lucide-react";
import type { GoogleUser } from "@/app/lib/google-auth";
import { portalDefinitions, portalRoles, isPortalRole } from "@/app/lib/portals";
import { requestJson } from "@/app/components/forms";
export default function RoleSwitcher({ role, demo, user }: { role: string; demo: boolean; user: GoogleUser }) {
  const router = useRouter(), pathname = usePathname(), [pending, startTransition] = useTransition(), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [open, setOpen] = useState(false), root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
    function outside(event: PointerEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } }
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  async function switchRole(next: string) {
    if (!isPortalRole(next) || next === role || busy || pending) return;
    setOpen(false); setBusy(true); setError("");
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
  return <div className="wt-account-switch" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} className="wt-account-trigger" aria-label="Switch workspace role" aria-expanded={open} aria-controls="workspace-account-panel" disabled={busy || pending} onClick={() => setOpen(value => !value)}><span className="wt-account-avatar">{user.name.charAt(0).toUpperCase()}</span><span className="wt-account-trigger-copy"><small>{demo ? "Demo account" : "Your account"}</small><strong>{isPortalRole(role) ? portalDefinitions[role].short : "Farmer"}</strong></span><ChevronDown size={17}/></button>
    <span className="wt-account-switch-status" role="status">{busy || pending ? "Opening workspace…" : ""}</span>
    {open && <section id="workspace-account-panel" className="wt-account-panel" aria-label="Account and workspaces"><div className="wt-account-panel-user"><span className="wt-account-avatar">{user.name.charAt(0).toUpperCase()}</span><div><strong>{user.name}</strong><small>{demo ? "Sample account · no real records" : user.email}</small></div></div><p className="wt-account-panel-caption">Switch workspace</p><div className="wt-account-role-list" aria-label="Choose workspace">{portalRoles.map(r => { const Icon = portalDefinitions[r].icon; return <button key={r} aria-pressed={r === role} onClick={() => { if (r === role) { setOpen(false); trigger.current?.focus(); } else void switchRole(r); }}><Icon size={19}/><span>{portalDefinitions[r].short}</span>{r === role && <Check size={17}/>}</button>; })}</div><p className="wt-account-panel-help">{demo ? "Each demo keeps its own sample activity." : "One account. Your records stay saved. Batch permissions don’t change."}</p><div className="wt-account-panel-footer"><Link href={demo ? "/demo" : "/profile"} onClick={() => setOpen(false)}><UserRound size={16}/>{demo ? "All demos" : "My profile"}</Link><a href={demo ? "/demo" : "/api/auth/logout"}><LogOut size={16}/>{demo ? "Leave demo" : "Sign out"}</a></div></section>}
    {error && <p role="alert" className="wt-error">{error}</p>}
  </div>;
}
