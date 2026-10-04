"use client";
import Link from "next/link";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="wt-loading"><h1>We couldn’t load this page.</h1><p>Your saved records have not been removed. Please try again in a moment.</p><button className="wt-button" onClick={reset}>Try again</button><p><Link href="/">Back to WoolTrace</Link></p></main>;}
