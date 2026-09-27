import { NextRequest, NextResponse } from "next/server";
import { DEMO_COOKIE, SESSION_COOKIE } from "@/app/lib/google-auth";
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
