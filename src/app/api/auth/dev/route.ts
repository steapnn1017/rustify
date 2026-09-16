import { NextResponse } from "next/server";
import { loadSteamProfile } from "@/lib/auth/steam";
import { setSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if ((!local && process.env.NODE_ENV === "production") || !process.env.DEV_STEAM_ID) {
    return NextResponse.json({ error: "Disabled" }, { status: 404 });
  }
  const profile = await loadSteamProfile(process.env.DEV_STEAM_ID);
  await setSession(profile);
  const returnTo = url.searchParams.get("returnTo") || "/account";
  return NextResponse.redirect(new URL(returnTo, url.origin));
}
