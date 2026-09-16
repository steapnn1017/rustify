import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { steamLoginUrl } from "@/lib/auth/steam";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || "/";
  const user = await getSession();
  if (user) {
    return NextResponse.redirect(new URL(returnTo.startsWith("/") ? returnTo : "/", url.origin));
  }
  return NextResponse.redirect(steamLoginUrl(returnTo, url.origin));
}
