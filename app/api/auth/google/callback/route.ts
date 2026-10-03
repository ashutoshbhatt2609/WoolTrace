import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, SESSION_COOKIE, STATE_COOKIE, VERIFIER_COOKIE } from "@/app/lib/google-auth";
import { appBaseUrl } from "@/app/lib/integration-config";
export async function GET(request:NextRequest){
 const base=appBaseUrl();
 function finish(path:string){const r=NextResponse.redirect(new URL(path,base));r.cookies.delete(STATE_COOKIE);r.cookies.delete(VERIFIER_COOKIE);return r;}
 const code=request.nextUrl.searchParams.get("code"),state=request.nextUrl.searchParams.get("state");
 const verifier=request.cookies.get(VERIFIER_COOKIE)?.value;
 if(!code || !state || state!==request.cookies.get(STATE_COOKIE)?.value || !verifier) return finish("/login?error=oauth");
 try{
  const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",signal:AbortSignal.timeout(12000),headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:process.env.GOOGLE_CLIENT_ID!,client_secret:process.env.GOOGLE_CLIENT_SECRET!,redirect_uri:new URL("/api/auth/google/callback",base).toString(),grant_type:"authorization_code",code_verifier:verifier}),cache:"no-store"});
  if(!tokenResponse.ok) return finish("/login?error=oauth");
  const token=z.object({access_token:z.string().min(1)}).parse(await tokenResponse.json());
  const profileResponse=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{signal:AbortSignal.timeout(12000),headers:{authorization:"Bearer "+token.access_token},cache:"no-store"});
  if(!profileResponse.ok) return finish("/login?error=profile");
  const user=z.object({sub:z.string().min(1),email:z.string().email(),name:z.string().min(1),picture:z.string().url().optional(),email_verified:z.literal(true)}).parse(await profileResponse.json());
  const response=finish("/dashboard");
  response.cookies.set(SESSION_COOKIE,await createSession(user),{httpOnly:true,secure:new URL(base).protocol==="https:",sameSite:"lax",maxAge:1209600,path:"/"});
  return response;
 }catch{return finish("/login?error=oauth");}
}
