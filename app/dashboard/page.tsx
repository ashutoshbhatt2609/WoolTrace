import { requireMember } from "@/app/lib/require-member";
import DashboardClient from "./dashboard-client";
export const dynamic="force-dynamic";
export default async function DashboardPage(){const {user,member}=await requireMember();return <DashboardClient user={user} role={member.role}/>;}
