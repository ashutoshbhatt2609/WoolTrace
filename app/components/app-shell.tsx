"use client";
import SheepMark from "@/app/components/sheep-mark";
import RoleSwitcher from "@/app/components/role-switcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Package, Store, HandCoins, QrCode, CalendarDays, UserRound, Menu, X, ArrowUpRight, LogOut, Workflow, FlaskConical } from "lucide-react";
import type { GoogleUser } from "@/app/lib/google-auth";
import { workspaceFor, canOpenModule } from "@/app/lib/workspaces";
const links=[
 ["/dashboard","Overview",LayoutDashboard],["/workspace/my-wool","My wool",Package],["/workspace/woolkart","Marketplace",Store],
 ["/workspace/reverse-bidding","Offers & payments",HandCoins],["/workspace/quality","Measurements",FlaskConical],["/workspace/traceability","Trace a batch",QrCode],["/workspace/services","Service planner",CalendarDays],["/workspace/market-prices","Farm weather",CalendarDays],["/assignments","My assignments",Package],["/profile","My profile",UserRound]
] as const;
export default function AppShell({user,role,children,demo=false}:{user:GoogleUser;role:string;children:ReactNode;demo?:boolean}){
 const pathname=usePathname(),[open,setOpen]=useState(false);
 const workspace=workspaceFor(role), home=demo?"/demo/"+role:"/dashboard";
 const visible=links.filter(([href])=>!href.startsWith("/workspace/")||canOpenModule(role,href.split("/").pop()!));
 return <div className="wt-app pastoral-theme"><a className="wt-skip" href="#workspace-content">Skip to content</a><header className="wt-mobile"><Link href={home}><SheepMark/> WoolTrace</Link><button aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header>
 {open&&<button className="wt-nav-backdrop" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}
 <aside className={"wt-sidebar "+(open?"is-open":"")}><Link href="/" className="wt-wordmark"><span><SheepMark/></span>WoolTrace</Link><div className="wt-role-label"><span className="wt-role-dot"/><div><strong>{workspace.title}</strong><small>{demo?"INTERACTIVE DEMO":"YOUR WORKSPACE"}</small></div></div><nav aria-label="Workspace navigation">{demo?<><Link href={home} aria-current="page"><LayoutDashboard size={19}/> Demo overview</Link><Link href="#demo-task" onClick={()=>setOpen(false)}><Workflow size={19}/> Try your workflow</Link><Link href="/demo"><UserRound size={19}/> Try another role</Link></>:<>{visible.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} aria-current={pathname===href?"page":undefined}><Icon size={19}/>{href==="/workspace/my-wool"&&role==="buyer"?"Purchased wool":href==="/workspace/reverse-bidding"&&role==="buyer"?"My offers & payments":label}</Link>)}<Link href={"/portal/"+role} aria-current={pathname==="/portal/"+role?"page":undefined}><Workflow size={19}/> {role==="transporter"?"Logistics":role==="warehouse"?"Storage log":role==="processor"?"Processing log":"My stage workspace"}</Link></>}</nav><div className="wt-sidebar-bottom">{demo?<Link href="/login">Sign in for real work <ArrowUpRight size={16}/></Link>:<><Link href="/demo">Explore a demo <ArrowUpRight size={16}/></Link>{["farmer","buyer","laboratory"].includes(role)&&<Link href="/labs">Karnataka lab directory <ArrowUpRight size={16}/></Link>}</>}<div className="wt-account"><span>{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>{demo?"Sample account · this tab only":"Google account"}</small></div><a href={demo?"/demo":"/api/auth/logout"} aria-label={demo?"Leave demo":"Sign out"}><LogOut size={18}/></a></div></div></aside>
 <main className="wt-main" id="workspace-content"><div className="wt-account-toolbar">{!demo&&<Link className="wt-text-link" href="/insights">Weather & wool insights <ArrowUpRight size={16}/></Link>}<RoleSwitcher key={role} role={role} demo={demo} user={user}/></div>{children}</main></div>;
}
