import { NextRequest, NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/app/lib/google-auth";

// Legacy links now open an isolated browser demo, never a database-backed identity.
export async function GET(request: NextRequest) {
 const response=NextResponse.redirect(new URL("/demo",request.url));
 response.cookies.delete(DEMO_COOKIE);
 return response;
}
