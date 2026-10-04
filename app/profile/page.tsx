import { requireMember } from "@/app/lib/require-member";
import ProfileClient from "./profile-client";
export const dynamic="force-dynamic";
export default async function Profile(){const {user,member}=await requireMember(false);return <ProfileClient user={user} profile={member}/>;}
