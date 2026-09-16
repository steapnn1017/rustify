import { loadJson } from "@/lib/persist";
import type { LeaderboardEntry, PlayerStats } from "./types";
import { serverCatalog } from "@/lib/live/catalog";
import { mockLeaderboard } from "./mock-leaderboard";

type Store = {
  stats: Record<string, PlayerStats>;
};

export type { LeaderboardEntry } from "./types";

export function listLeaderboard(serverId?: string): LeaderboardEntry[] {
  const store = loadJson<Store>("player-stats.json", { stats: {} });
  const rows = Object.values(store.stats).filter((row) => {
    if (row.source !== "live") return false;
    if (serverId && row.serverId !== serverId) return false;
    return serverCatalog.some((server) => server.id === row.serverId);
  });

  if (rows.length === 0) {
    return mockLeaderboard(serverId);
  }

  rows.sort((a, b) => {
    if (b.kills !== a.kills) return b.kills - a.kills;
    return b.kd - a.kd;
  });

  return rows.map((row, index) => ({
    ...row,
    name: `Steam ${row.steamId.slice(-4)}`,
    avatar: "",
    rank: index + 1,
  }));
}
