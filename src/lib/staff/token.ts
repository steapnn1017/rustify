import { createHmac, timingSafeEqual } from "crypto";

type ReviewKind = "discord";

export type ReviewPayload = {
  kind: ReviewKind;
  steamId: string;
  exp: number;
};

function secret() {
  return process.env.SESSION_SECRET || "dev-only-session-secret-change-me-32ch";
}

export function signReviewToken(payload: Omit<ReviewPayload, "exp">, ttlMs = 1000 * 60 * 60 * 24 * 14) {
  const data: ReviewPayload = { ...payload, exp: Date.now() + ttlMs };
  const body = Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readReviewToken(token: string): ReviewPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ReviewPayload;
    if (!data.steamId || !data.kind || !data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
