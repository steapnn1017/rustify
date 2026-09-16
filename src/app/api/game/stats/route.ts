import { NextResponse } from "next/server";
import { upsertPlayerStats } from "@/lib/stats";
import { serverCatalog } from "@/lib/live/catalog";

export async function POST(request: Request) {
  const secret = process.env.GAME_API_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    steamId?: string;
    serverId?: string;
    kills?: number;
    deaths?: number;
    playtimeHours?: number;
    resourcesGathered?: number;
    structuresBuilt?: number;
    headshots?: number;
    lastSeenAt?: string | null;
  };

  if (!body.steamId || !body.serverId || !serverCatalog.some((server) => server.id === body.serverId)) {
    return NextResponse.json({ error: "steamId and valid serverId required" }, { status: 400 });
  }

  const stats = upsertPlayerStats(body.steamId, body.serverId, {
    kills: body.kills,
    deaths: body.deaths,
    playtimeHours: body.playtimeHours,
    resourcesGathered: body.resourcesGathered,
    structuresBuilt: body.structuresBuilt,
    headshots: body.headshots,
    lastSeenAt: body.lastSeenAt === undefined ? new Date().toISOString() : body.lastSeenAt,
  });

  return NextResponse.json(stats);
}
