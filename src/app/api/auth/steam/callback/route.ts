import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth/session";
import { extractSteamId, loadSteamProfile, safeReturnTo, verifySteamAssertion } from "@/lib/auth/steam";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const valid = await verifySteamAssertion(url);
  if (!valid) {
    return NextResponse.redirect(new URL("/?auth=failed", origin));
  }
  const steamId =
    extractSteamId(url.searchParams.get("openid.claimed_id")) ||
    extractSteamId(url.searchParams.get("openid.identity"));
  if (!steamId) {
    return NextResponse.redirect(new URL("/?auth=failed", origin));
  }
  const profile = await loadSteamProfile(steamId);
  await setSession(profile);
  return NextResponse.redirect(new URL(returnTo, origin));
}
