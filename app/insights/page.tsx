import { requireMember } from "@/app/lib/require-member";
import InsightsClient from "./insights-client";
export default async function InsightsPage() {
  const { user, member } = await requireMember();
  return <InsightsClient user={user} role={member.role}/>;
}
