import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const expected = process.env.APP_BASE_URL ? new URL(process.env.APP_BASE_URL).origin : request.nextUrl.origin;
    if (!origin || (origin !== expected && origin !== request.nextUrl.origin)) {
      return NextResponse.json({ error: "This request must come from WoolTrace." }, { status: 403 });
    }
  }
  return NextResponse.next();
}
export const config = { matcher: "/api/:path*" };
