import { requireMember } from "@/app/lib/require-member";
import AssignmentsClient from "./assignments-client";
export const dynamic = "force-dynamic";
export default async function AssignmentsPage() {
  const { user, member } = await requireMember(false);
  return <AssignmentsClient user={user} role={member.role}/>;
}
