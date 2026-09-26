import { ArrowLeft, ArrowRight, LockKeyhole, Sprout } from "lucide-react";
import Link from "next/link";
import { googleAuthConfigured } from "@/app/lib/google-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = googleAuthConfigured();
  return (
    <main className="auth-shell">
      <section className="auth-art" aria-label="Sheep grazing on a wool farm">
        <Link href="/" className="auth-brand"><span className="brand-mark"><Sprout className="size-4" /></span> WoolTrace</Link>
        <div><p className="kicker light">FARMER-FIRST COMMERCE</p><h1>Your wool.<br />Your proof.<br />Your price.</h1><p>One secure account for farmers, buyers, assessors, transporters, warehouses and processors.</p></div>
      </section>
      <section className="auth-panel">
        <Link className="auth-back" href="/"><ArrowLeft className="size-4" /> Back home</Link>
        <div className="auth-card">
          <span className="auth-icon"><LockKeyhole /></span>
          <p className="kicker">SECURE ACCESS</p>
          <h2>Welcome to WoolTrace</h2>
          <p>Sign in to manage batches, offers, certificates, bookings and the complete wool journey.</p>
          {error === "configuration" && <div className="auth-alert">Google sign-in is ready in the app, but the production OAuth credentials still need to be added.</div>}
          {error && error !== "configuration" && <div className="auth-alert">Google could not complete sign-in. Please try again.</div>}
          <a className={`google-button ${!configured ? "needs-config" : ""}`} href="/api/auth/google">
            <span className="google-g">G</span> Continue with Google <ArrowRight className="size-4" />
          </a>
          <p className="auth-note">By continuing, you agree to keep batch and trading records accurate. Your account role can be changed from your profile.</p>
        </div>
      </section>
    </main>
  );
}
