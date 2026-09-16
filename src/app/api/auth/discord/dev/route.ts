import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { linkDiscord } from "@/lib/users/store";
import { site } from "@/lib/site";

/** Local-only Discord link when OAuth app credentials are not configured. */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled" }, { status: 404 });
  }
  const user = await getSession();
  if (!user) {
    return NextResponse.redirect(new URL("/api/auth/steam?returnTo=/account", site.url));
  }
  const username = process.env.DEV_DISCORD_USERNAME || "rustify_dev";
  const id = process.env.DEV_DISCORD_ID || `dev${user.steamId.slice(-8)}`;
  linkDiscord(user.steamId, {
    id,
    username,
    globalName: username,
    avatar: null,
  });
  const returnTo = new URL(request.url).searchParams.get("returnTo") || "/account?discord=linked";
  return NextResponse.redirect(new URL(returnTo, site.url));
}
