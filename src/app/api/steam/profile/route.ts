import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { loadSteamProfile } from "@/lib/auth/steam";
import { isSteamId64 } from "@/lib/commerce/coupons";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in with Steam first." }, { status: 401 });

  const steamId = new URL(request.url).searchParams.get("id")?.trim() || "";
  if (!isSteamId64(steamId)) {
    return NextResponse.json({ error: "Enter a valid SteamID64." }, { status: 400 });
  }

  const profile = await loadSteamProfile(steamId);
  if (/^Player \d{4}$/.test(profile.name)) {
    return NextResponse.json({ error: "Steam profile not found." }, { status: 404 });
  }
  return NextResponse.json(profile);
}
