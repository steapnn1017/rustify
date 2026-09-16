import { NextResponse } from "next/server";
import { getSession, readOAuthState } from "@/lib/auth/session";
import { exchangeDiscordCode } from "@/lib/discord/oauth";
import { screenLinkedAccount } from "@/lib/support/screen";
import { linkDiscord } from "@/lib/users/store";
import { site } from "@/lib/site";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const user = await getSession();
  if (!user || !code || !state) {
    return NextResponse.redirect(new URL("/support?discord=failed", origin));
  }
  const parsed = readOAuthState(state);
  if (!parsed || parsed.steamId !== user.steamId) {
    return NextResponse.redirect(new URL("/support?discord=failed", origin));
  }
  try {
    const discord = await exchangeDiscordCode(code, origin);
    const linked = linkDiscord(user.steamId, discord);
    if (linked.discord) {
      await screenLinkedAccount({ origin, user, discord: linked.discord });
    }
    const dest = new URL(parsed.returnTo || "/support", origin);
    dest.searchParams.set("discord", "linked");
    return NextResponse.redirect(dest);
  } catch {
    return NextResponse.redirect(new URL("/support?discord=failed", site.url));
  }
}
