import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { unlinkDiscord } from "@/lib/users/store";
import { site } from "@/lib/site";

export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  unlinkDiscord(user.steamId);
  return NextResponse.redirect(new URL("/account?discord=unlinked", site.url), { status: 303 });
}
