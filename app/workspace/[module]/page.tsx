import { notFound, redirect } from "next/navigation";
import { canOpenModule } from "@/app/lib/workspaces";
import { requireMember } from "@/app/lib/require-member";
import WorkspaceClient from "./workspace-client";
export const dynamic="force-dynamic";
const modules=["my-wool","woolkart","reverse-bidding","traceability","quality","transport","warehouses","services","market-prices"];
export default async function WorkspacePage({params}:{params:Promise<{module:string}>}){
 const {module}=await params;if(!modules.includes(module))notFound();const {user,member}=await requireMember();
 if(!canOpenModule(member.role,module))redirect("/dashboard");
 return <WorkspaceClient key={module} module={module} user={user} role={member.role}/>;
}
