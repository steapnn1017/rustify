import { NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/auth/session";
import { isPlaceholderSteamProfile, loadSteamProfile } from "@/lib/auth/steam";

export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPlaceholderSteamProfile(user)) {
    return NextResponse.json({ user, refreshed: false });
  }
  const profile = await loadSteamProfile(user.steamId);
  await setSession(profile);
  return NextResponse.json({ user: profile, refreshed: true });
}
