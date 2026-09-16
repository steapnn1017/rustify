import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type SessionUser = {
  steamId: string;
  name: string;
  avatar: string;
};

const COOKIE = "rustify_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function siteUrl() {
  return process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
}

function isLocalSite() {
  const url = siteUrl();
  return url.includes("localhost") || url.includes("127.0.0.1");
}

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production" && !isLocalSite()) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return "dev-only-session-secret-change-me-32ch";
}

function useSecureCookies() {
  const url = siteUrl();
  if (url.startsWith("http://")) return false;
  if (url.startsWith("https://")) return true;
  return process.env.NODE_ENV === "production" && !isLocalSite();
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string): SessionUser | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return decode(token);
}

export async function setSession(user: SessionUser) {
  const jar = await cookies();
  jar.set(COOKIE, encode(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureCookies(),
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

function safePath(value: string | undefined, fallback = "/account") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function signOAuthState(steamId: string, returnTo = "/account") {
  const payload = Buffer.from(
    JSON.stringify({ steamId, returnTo: safePath(returnTo), at: Date.now() }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readOAuthState(token: string): { steamId: string; returnTo: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      steamId?: string;
      returnTo?: string;
      at?: number;
    };
    if (!data.steamId || !data.at || Date.now() - data.at > 15 * 60 * 1000) return null;
    return { steamId: data.steamId, returnTo: safePath(data.returnTo) };
  } catch {
    return null;
  }
}
