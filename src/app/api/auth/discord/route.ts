import { NextResponse } from "next/server";
import { getSession, signOAuthState } from "@/lib/auth/session";
import { discordAuthorizeUrl, discordConfigured } from "@/lib/discord/oauth";
import { site } from "@/lib/site";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.redirect(new URL("/api/auth/steam?returnTo=/account", site.url));
  }
  if (!discordConfigured()) {
    return NextResponse.redirect(new URL("/account?discord=missing_config", site.url));
  }
  const origin = new URL(request.url).origin;
  const state = signOAuthState(user.steamId);
  return NextResponse.redirect(discordAuthorizeUrl(state, origin));
}
