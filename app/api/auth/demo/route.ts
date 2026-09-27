import { NextRequest, NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/app/lib/google-auth";

export async function GET(request: NextRequest) {
  if (process.env.DEMO_MODE !== "true") {
    return NextResponse.redirect(new URL("/login?error=demo-disabled", request.url));
  }
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(DEMO_COOKIE, "farmer", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
