import { requireMember } from "@/app/lib/require-member";
import ProfileClient from "../profile/profile-client";
export const dynamic="force-dynamic";
export default async function Onboarding(){const {user,member}=await requireMember(false);return <ProfileClient user={user} profile={member} onboarding/>;}
