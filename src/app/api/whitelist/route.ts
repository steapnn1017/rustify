import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/users/store";
import { getWhitelistRequest, submitWhitelistRequest } from "@/lib/whitelist/store";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in with Steam first." }, { status: 401 });
  return NextResponse.json({ request: getWhitelistRequest(user.steamId) });
}

export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in with Steam first." }, { status: 401 });
  const profile = getUserProfile(user.steamId);
  if (!profile.discord) {
    return NextResponse.json({ error: "Link Discord before sending a whitelist request." }, { status: 400 });
  }
  const request = submitWhitelistRequest({
    steamId: user.steamId,
    discordId: profile.discord.id,
    discordName: profile.discord.globalName || profile.discord.username,
  });
  return NextResponse.json({ request });
}
