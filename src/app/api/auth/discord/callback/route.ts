import { NextResponse } from "next/server";
import { getSession, readOAuthState } from "@/lib/auth/session";
import { exchangeDiscordCode } from "@/lib/discord/oauth";
import { linkDiscord } from "@/lib/users/store";
import { site } from "@/lib/site";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const user = await getSession();
  if (!user || !code || !state) {
    return NextResponse.redirect(new URL("/account?discord=failed", origin));
  }
  const parsed = readOAuthState(state);
  if (!parsed || parsed.steamId !== user.steamId) {
    return NextResponse.redirect(new URL("/account?discord=failed", origin));
  }
  try {
    const discord = await exchangeDiscordCode(code, origin);
    linkDiscord(user.steamId, discord);
    return NextResponse.redirect(new URL("/account?discord=linked", origin));
  } catch {
    return NextResponse.redirect(new URL("/account?discord=failed", site.url));
  }
}
