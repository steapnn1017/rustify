import { NextResponse } from "next/server";
import { getSession, signOAuthState } from "@/lib/auth/session";
import { discordAuthorizeUrl, discordConfigured } from "@/lib/discord/oauth";
import { safeReturnTo } from "@/lib/auth/steam";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const returnTo = safeReturnTo(url.searchParams.get("returnTo") || "/support");
  const user = await getSession();
  if (!user) {
    const next = `/api/auth/discord?returnTo=${encodeURIComponent(returnTo)}`;
    return NextResponse.redirect(
      new URL(`/api/auth/steam?returnTo=${encodeURIComponent(next)}`, origin),
    );
  }
  if (!discordConfigured()) {
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (local) {
      return NextResponse.redirect(
        new URL(`/api/auth/discord/dev?returnTo=${encodeURIComponent(returnTo)}`, origin),
      );
    }
    return NextResponse.redirect(new URL("/account?discord=missing_config", origin));
  }
  const state = signOAuthState(user.steamId, returnTo);
  return NextResponse.redirect(discordAuthorizeUrl(state, origin));
}
