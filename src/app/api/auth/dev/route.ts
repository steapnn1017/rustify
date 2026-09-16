import { NextResponse } from "next/server";
import { loadSteamProfile } from "@/lib/auth/steam";
import { setSession } from "@/lib/auth/session";
import { site } from "@/lib/site";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production" || !process.env.DEV_STEAM_ID) {
    return NextResponse.json({ error: "Disabled" }, { status: 404 });
  }
  const profile = await loadSteamProfile(process.env.DEV_STEAM_ID);
  await setSession(profile);
  const returnTo = new URL(request.url).searchParams.get("returnTo") || "/account";
  return NextResponse.redirect(new URL(returnTo, site.url));
}
