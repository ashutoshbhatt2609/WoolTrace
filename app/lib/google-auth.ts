import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
export type GoogleUser={sub:string;email:string;name:string;picture?:string};
export const SESSION_COOKIE="wooltrace_session";
export const STATE_COOKIE="wooltrace_oauth_state";
export const VERIFIER_COOKIE="wooltrace_oauth_verifier";
export const DEMO_COOKIE="wooltrace_demo_session";
const profile=z.object({sub:z.string().min(1).max(255),email:z.string().email(),name:z.string().min(1).max(255),picture:z.string().url().optional()});
function signature(value:string){return createHmac("sha256",process.env.AUTH_SECRET!).update(value).digest("base64url");}
export function googleAuthConfigured(){return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && (process.env.AUTH_SECRET?.length??0)>=32);}
export async function createSession(user:GoogleUser){
 if((process.env.AUTH_SECRET?.length??0)<32) throw new Error("Session secret must contain at least 32 characters");
 const payload=Buffer.from(JSON.stringify({...profile.parse(user),exp:Date.now()+1209600000})).toString("base64url");
 return payload+"."+signature(payload);
}
export async function getGoogleUser():Promise<GoogleUser|null>{
 const jar=await cookies();
 if(process.env.DEMO_MODE==="true" && jar.get(DEMO_COOKIE)?.value==="farmer") return {sub:"demo-farmer",email:"farmer.demo@wooltrace.in",name:"Demo farmer"};
 const value=jar.get(SESSION_COOKIE)?.value;
 if(!value || value.length>6000 || !process.env.AUTH_SECRET) return null;
 try{
  const parts=value.split("."); if(parts.length!==2) return null;
  const expected=Buffer.from(signature(parts[0]));const supplied=Buffer.from(parts[1]);
  if(expected.length!==supplied.length || !timingSafeEqual(expected,supplied)) return null;
  const parsed=profile.extend({exp:z.number().finite()}).parse(JSON.parse(Buffer.from(parts[0],"base64url").toString()));
  if(parsed.exp<Date.now() || parsed.exp>Date.now()+1209660000) return null;
  return {sub:parsed.sub,email:parsed.email,name:parsed.name,picture:parsed.picture};
 }catch{return null;}
}
