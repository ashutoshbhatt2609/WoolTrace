import { NextRequest, NextResponse } from "next/server";
import { googleAuthConfigured, STATE_COOKIE } from "@/app/lib/google-auth";
import { appBaseUrl } from "@/app/lib/integration-config";

export async function GET(request: NextRequest) {
  if (!googleAuthConfigured()) return NextResponse.redirect(new URL("/login?error=configuration", request.url));
  const state = crypto.randomUUID();
  const redirectUri = new URL("/api/auth/google/callback", appBaseUrl()).toString();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}
