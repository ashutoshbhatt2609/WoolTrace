import { redirect } from "next/navigation";
import { getGoogleUser } from "@/app/lib/google-auth";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getGoogleUser();
  if (!user && process.env.NODE_ENV === "production") redirect("/login");
  return <DashboardClient user={user ?? { sub: "local-preview", email: "farmer@wooltrace.test", name: "Rafiq Ahmad" }} />;
}
