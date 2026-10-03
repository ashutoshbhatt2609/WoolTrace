import { ArrowLeft, ArrowRight, LockKeyhole, Sprout, UserRound } from "lucide-react";
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
          <p>Sign in to record shearing, manage batches, compare offers and maintain each wool journey.</p>
          {error === "demo-disabled" && <div className="auth-alert">The demo account is temporarily unavailable.</div>}
          {error && error !== "configuration" && error !== "demo-disabled" && <div className="auth-alert">Sign-in could not be completed. Please try again.</div>}
          <a className="demo-button" href="/api/auth/demo">
            <UserRound className="size-5" /> Enter farmer demo <ArrowRight className="size-4" />
          </a>
          {configured ? (
            <a className="google-button" href="/api/auth/google">
              <span className="google-g">G</span> Continue with Google <ArrowRight className="size-4" />
            </a>
          ) : (
            <span className="google-button disabled" aria-disabled="true"><span className="google-g">G</span> Google sign-in coming soon</span>
          )}
          <p className="auth-note">The demo uses sample farmer and wool-batch data. Changes are for demonstration only.</p>
        </div>
      </section>
    </main>
  );
}
