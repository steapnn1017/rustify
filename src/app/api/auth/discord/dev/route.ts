import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { screenLinkedAccount } from "@/lib/support/screen";
import { linkDiscord } from "@/lib/users/store";
import { safeReturnTo } from "@/lib/auth/steam";

/** Local-only Discord link when OAuth app credentials are not configured. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (!local && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled" }, { status: 404 });
  }
  const user = await getSession();
  const returnTo = safeReturnTo(url.searchParams.get("returnTo") || "/account");
  if (!user) {
    const next = `/api/auth/discord/dev?returnTo=${encodeURIComponent(returnTo)}`;
    return NextResponse.redirect(
      new URL(`/api/auth/steam?returnTo=${encodeURIComponent(next)}`, origin),
    );
  }
  const username = process.env.DEV_DISCORD_USERNAME || "rustify_dev";
  const id = process.env.DEV_DISCORD_ID || `dev${user.steamId.slice(-8)}`;
  const linked = linkDiscord(user.steamId, {
    id,
    username,
    globalName: username,
    avatar: null,
  });
  if (linked.discord) {
    await screenLinkedAccount({ origin, user, discord: linked.discord });
  }
  const dest = new URL(returnTo, origin);
  dest.searchParams.set("discord", "linked");
  return NextResponse.redirect(dest);
}
