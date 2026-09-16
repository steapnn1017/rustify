import { NextResponse } from "next/server";
import { inGameState } from "@/lib/entitlements/store";
import { serverCatalog } from "@/lib/live/catalog";

function authorized(request: Request) {
  const secret = process.env.GAME_API_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : request.headers.get("x-game-key");
  return token === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const steamId = url.searchParams.get("steamId") || "";
  const serverId = url.searchParams.get("serverId") || "";
  if (!/^\d{17}$/.test(steamId) || !serverCatalog.some((server) => server.id === serverId)) {
    return NextResponse.json({ error: "steamId (17 digits) and serverId are required." }, { status: 400 });
  }
  return NextResponse.json(inGameState(steamId, serverId));
}
