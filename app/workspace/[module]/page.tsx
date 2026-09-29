import { notFound, redirect } from "next/navigation";
import { getGoogleUser } from "@/app/lib/google-auth";
import WorkspaceClient from "./workspace-client";

const workspaceModules = ["my-wool", "woolkart", "reverse-bidding", "traceability", "quality", "transport", "warehouses", "services", "market-prices"] as const;
type WorkspaceModule = typeof workspaceModules[number];

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!workspaceModules.includes(module as WorkspaceModule)) notFound();
  const user = await getGoogleUser();
  if (!user && process.env.NODE_ENV === "production") redirect("/login");
  return <WorkspaceClient module={module as WorkspaceModule} user={user ?? { sub: "local-preview", email: "farmer@wooltrace.test", name: "Rafiq Ahmad" }} />;
}
