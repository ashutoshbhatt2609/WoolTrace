"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Package, RefreshCw } from "lucide-react";
import AppShell from "@/app/components/app-shell";
import { requestJson } from "@/app/components/forms";
import type { GoogleUser } from "@/app/lib/google-auth";
import { isPortalRole, portalDefinitions } from "@/app/lib/portals";

type Assignment = { id: string; batchId: string; role: string; breed: string; weightKg: number; status: string };
type Result = { assignments: Assignment[]; pagination: { page: number; hasNext: boolean; total: number } };
export default function AssignmentsClient({ user, role }: { user: GoogleUser; role: string }) {
  const router = useRouter();
  const [data, setData] = useState<Result | null>(null), [loading, setLoading] = useState(true);
  const [error, setError] = useState(""), [opening, setOpening] = useState("");
  const load = useCallback(async (page = 1, append = false) => {
    setLoading(true); setError("");
    try {
      const next = await requestJson<Result>("/api/assignments?page=" + page + "&limit=24");
      setData(current => append && current ? { ...next, assignments: [...current.assignments, ...next.assignments] } : next);
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    requestJson<Result>("/api/assignments?page=1&limit=24").then(next => { if (active) setData(next); })
      .catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function open(assignmentId: string) {
    if (opening) return;
    setOpening(assignmentId); setError("");
    try {
      const result = await requestJson<{ redirect: string }>("/api/assignments", { method: "POST", body: JSON.stringify({ assignmentId }) });
      router.push(result.redirect); router.refresh();
    } catch (e) { setError((e as Error).message); setOpening(""); }
  }
  return <AppShell user={user} role={role}>
    <header className="wt-page-head"><div><p className="wt-eyebrow">INVITED TO YOUR GOOGLE EMAIL</p><h1>My assignments</h1><p>Here’s the wool you’ve been asked to work on. Open an assignment to use the right tools for that job.</p></div><button className="wt-outline" disabled={loading || !!opening} onClick={() => load()}><RefreshCw size={16}/> Refresh</button></header>
    <div className="wt-access-note"><Package size={22}/><div><strong>{user.email}</strong><p>Your access is for the listed batches and stages only. It does not make you the seller or owner.</p></div></div>
    {error && <div className="wt-error" role="alert">{error} <button onClick={() => load()}>Try again</button></div>}
    {loading && !data && <p role="status">Finding your assignments…</p>}
    {data && !data.assignments.length && <section className="wt-card wt-empty"><Package size={38}/><h2>No assignments yet</h2><p>Ask the batch owner to grant access to this Google email. Then refresh this page. A service plan alone doesn’t grant batch access.</p><Link className="wt-outline" href="/dashboard">Back to my workspace <ArrowRight size={16}/></Link></section>}
    <div className="wt-assignment-grid" aria-busy={loading}>{data?.assignments.map(a => {
      if (!isPortalRole(a.role)) return null;
      const portal = portalDefinitions[a.role], Icon = portal.icon;
      return <article className="wt-card wt-assignment" key={a.id}><div className="wt-assignment-heading"><span className="wt-assignment-icon"><Icon size={24}/></span><span className="wt-pill">{portal.short}</span></div><h2>{a.breed} wool</h2><p>{a.weightKg.toLocaleString()} kg · {a.status.replaceAll("_", " ")}</p><code>{a.batchId}</code><div className="wt-assignment-permission"><small>You can record</small><p>{portal.owns.join(" · ")}</p></div><button className="wt-button" disabled={!!opening} onClick={() => open(a.id)}>{opening === a.id ? "Opening your workspace…" : "Open " + portal.short.toLowerCase() + " workspace"}<ArrowRight size={16}/></button><Link className="wt-text-link" href={"/batch/" + a.batchId}>Read the public journey <ArrowRight size={15}/></Link></article>;
    })}</div>
    {data?.pagination.hasNext && <div className="wt-load-more"><p>{data.assignments.length} of {data.pagination.total} assignments</p><button className="wt-outline" disabled={loading} onClick={() => load(data.pagination.page + 1, true)}>{loading ? "Loading…" : "Show more assignments"}</button></div>}
  </AppShell>;
}
