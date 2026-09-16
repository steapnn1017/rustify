import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listNotices, markNoticesRead, unreadNoticeCount } from "@/lib/support/store";
import { getUserProfile, setNotificationPrefs } from "@/lib/users/store";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ notices: [], unread: 0 });
  return NextResponse.json({
    notices: listNotices(user.steamId).slice(0, 20),
    unread: unreadNoticeCount(user.steamId),
    prefs: getUserProfile(user.steamId).notifications,
  });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    read?: boolean;
    discordDm?: boolean;
    browser?: boolean;
  } | null;
  if (body?.read) markNoticesRead(user.steamId);
  if (typeof body?.discordDm === "boolean" || typeof body?.browser === "boolean") {
    setNotificationPrefs(user.steamId, {
      ...(typeof body.discordDm === "boolean" ? { discordDm: body.discordDm } : {}),
      ...(typeof body.browser === "boolean" ? { browser: body.browser } : {}),
    });
  }
  return NextResponse.json({
    notices: listNotices(user.steamId).slice(0, 20),
    unread: unreadNoticeCount(user.steamId),
    prefs: getUserProfile(user.steamId).notifications,
  });
}
