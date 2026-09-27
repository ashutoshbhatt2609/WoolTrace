import "server-only";
import { cookies } from "next/headers";

export type GoogleUser = { sub: string; email: string; name: string; picture?: string };
export const SESSION_COOKIE = "wooltrace_session";
export const STATE_COOKIE = "wooltrace_oauth_state";
export const DEMO_COOKIE = "wooltrace_demo_session";

const encode = (input: Uint8Array | string) => {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const decode = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(Array.from(atob(normalized), (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""));
};

async function signature(value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return encode(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export function googleAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.AUTH_SECRET);
}

export async function createSession(user: GoogleUser) {
  const payload = encode(JSON.stringify({ ...user, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 }));
  const sig = await signature(payload);
  if (!sig) throw new Error("AUTH_SECRET is missing");
  return `${payload}.${sig}`;
}

export async function getGoogleUser(): Promise<GoogleUser | null> {
  const cookieStore = await cookies();
  if (process.env.DEMO_MODE === "true" && cookieStore.get(DEMO_COOKIE)?.value === "farmer") {
    return {
      sub: "demo-farmer",
      email: "farmer.demo@wooltrace.in",
      name: "Rafiq Ahmad",
    };
  }
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const [payload, supplied] = value.split(".");
  if (!payload || !supplied || (await signature(payload)) !== supplied) return null;
  try {
    const parsed = JSON.parse(decode(payload));
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return { sub: parsed.sub, email: parsed.email, name: parsed.name, picture: parsed.picture };
  } catch { return null; }
}
