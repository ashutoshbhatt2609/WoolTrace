import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, STATE_COOKIE, type GoogleUser } from "@/app/lib/google-auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expected = request.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || state !== expected) return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
  if (!tokenResponse.ok) return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  const token = (await tokenResponse.json()) as { access_token: string };
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` } });
  if (!profileResponse.ok) return NextResponse.redirect(new URL("/login?error=profile", request.url));
  const profile = (await profileResponse.json()) as GoogleUser;
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(SESSION_COOKIE, await createSession(profile), { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 14, path: "/" });
  response.cookies.delete(STATE_COOKIE);
  return response;
}
