import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { serverCatalog } from "@/lib/live/catalog";
import { setStatsServer } from "@/lib/users/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { serverId?: string };
  const server = serverCatalog.find((item) => item.id === body.serverId);
  if (!server) return NextResponse.json({ error: "Unknown server" }, { status: 400 });

  const profile = setStatsServer(user.steamId, server.id);
  return NextResponse.json({ statsServerId: profile.statsServerId });
}
