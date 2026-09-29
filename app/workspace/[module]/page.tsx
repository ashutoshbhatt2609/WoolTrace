import { notFound, redirect } from "next/navigation";
import { getGoogleUser } from "@/app/lib/google-auth";
import WorkspaceClient, { workspaceModules, type WorkspaceModule } from "./workspace-client";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!workspaceModules.includes(module as WorkspaceModule)) notFound();
  const user = await getGoogleUser();
  if (!user && process.env.NODE_ENV === "production") redirect("/login");
  return <WorkspaceClient module={module as WorkspaceModule} user={user ?? { sub: "local-preview", email: "farmer@wooltrace.test", name: "Rafiq Ahmad" }} />;
}
