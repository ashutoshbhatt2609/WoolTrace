import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { googleAuthConfigured, STATE_COOKIE, VERIFIER_COOKIE } from "@/app/lib/google-auth";
import { appBaseUrl } from "@/app/lib/integration-config";
export async function GET(request:NextRequest){
 if(!googleAuthConfigured()) return NextResponse.redirect(new URL("/login?error=configuration",request.url));
 const state=randomBytes(32).toString("base64url"),verifier=randomBytes(48).toString("base64url");
 const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
 url.search=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID!,redirect_uri:new URL("/api/auth/google/callback",appBaseUrl()).toString(),response_type:"code",scope:"openid email profile",state,prompt:"select_account",code_challenge:createHash("sha256").update(verifier).digest("base64url"),code_challenge_method:"S256"}).toString();
 const response=NextResponse.redirect(url);
 const options={httpOnly:true,secure:new URL(appBaseUrl()).protocol==="https:",sameSite:"lax" as const,maxAge:600,path:"/"};
 response.cookies.set(STATE_COOKIE,state,options);response.cookies.set(VERIFIER_COOKIE,verifier,options);return response;
}
