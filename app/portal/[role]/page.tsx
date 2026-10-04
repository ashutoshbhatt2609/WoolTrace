import { notFound, redirect } from "next/navigation";
import { requireMember } from "@/app/lib/require-member";
import { isPortalRole } from "@/app/lib/portals";
import PortalActions from "./portal-actions";
export const dynamic="force-dynamic";
export default async function PortalPage({params,searchParams}:{params:Promise<{role:string}>;searchParams:Promise<{batchId?:string}>}){
 const {role}=await params;if(!isPortalRole(role))notFound();const {user,member}=await requireMember();
 if(role!==member.role)redirect("/portal/"+member.role);
 const {batchId}=await searchParams;
 return <PortalActions key={role+":"+(batchId??"")} role={role} actualRole={member.role} user={user} initialBatchId={batchId}/>;
}
