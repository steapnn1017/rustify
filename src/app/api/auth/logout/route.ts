import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { site } from "@/lib/site";

export async function POST() {
  await clearSession();
  return NextResponse.redirect(new URL("/", site.url), { status: 303 });
}
