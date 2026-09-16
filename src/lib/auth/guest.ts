import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE = "rustify_guest";

function secret() {
  return process.env.SESSION_SECRET || "dev-only-session-secret-change-me-32ch";
}

function sign(id: string) {
  return createHmac("sha256", secret()).update(id).digest("base64url");
}

export async function getGuestId() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  const expected = sign(id);
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return id;
}

export async function getOrCreateGuestId() {
  const existing = await getGuestId();
  if (existing) return existing;
  const id = randomBytes(12).toString("hex");
  const jar = await cookies();
  jar.set(COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !`${process.env.SITE_URL || ""}`.includes("localhost"),
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
