import { redirect } from "next/navigation";
import { requireMember } from "@/app/lib/require-member";
export const dynamic="force-dynamic";
export default async function PortalsPage(){const {member}=await requireMember();redirect("/portal/"+member.role);}
