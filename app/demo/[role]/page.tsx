import { notFound } from "next/navigation";
import { isPortalRole } from "@/app/lib/portals";
import DemoClient from "./demo-client";
export default async function DemoRolePage({params}:{params:Promise<{role:string}>}){const {role}=await params;if(!isPortalRole(role))notFound();return <DemoClient key={role} role={role}/>;}
