"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Sprout, LayoutDashboard, Package, Store, HandCoins, QrCode, CalendarDays, UserRound, Menu, X, ArrowUpRight, LogOut, Workflow } from "lucide-react";
import type { GoogleUser } from "@/app/lib/google-auth";
const links=[
 ["/dashboard","Overview",LayoutDashboard],["/workspace/my-wool","My wool",Package],["/workspace/woolkart","Marketplace",Store],
 ["/workspace/reverse-bidding","Offers & payments",HandCoins],["/workspace/traceability","Trace a batch",QrCode],["/workspace/services","Service planner",CalendarDays],["/workspace/market-prices","Farm weather",CalendarDays],["/profile","My profile",UserRound]
] as const;
export default function AppShell({user,children}:{user:GoogleUser;children:ReactNode}){
 const pathname=usePathname(),[open,setOpen]=useState(false);
 return <div className="wt-app"><header className="wt-mobile"><Link href="/dashboard"><Sprout/> WoolTrace</Link><button aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header>
 <aside className={"wt-sidebar "+(open?"is-open":"")}><Link href="/" className="wt-wordmark"><span><Sprout/></span>WoolTrace</Link><p className="wt-eyebrow">FARM TO FABRIC</p><nav>{links.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} aria-current={pathname===href?"page":undefined}><Icon size={19}/>{label}</Link>)}<Link href="/portals"><Workflow size={19}/> Stage workspaces</Link></nav><div className="wt-sidebar-bottom"><Link href="/labs">Karnataka lab directory <ArrowUpRight size={16}/></Link><div className="wt-account"><span>{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>{user.sub==="demo-farmer"?"Local demo":"Google account"}</small></div><a href="/api/auth/logout" aria-label="Sign out"><LogOut size={18}/></a></div></div></aside>
 <main className="wt-main">{children}</main></div>;
}
