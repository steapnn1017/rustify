import type { PlayerStats, PlayerStatsProvider } from "./types";
import { getStoredStats } from "./store";

export function emptyStats(steamId: string, serverId: string): PlayerStats {
  return {
    steamId,
    serverId,
    kills: 0,
    deaths: 0,
    kd: 0,
    playtimeHours: 0,
    resourcesGathered: 0,
    structuresBuilt: 0,
    headshots: 0,
    lastSeenAt: null,
    source: "mock",
  };
}

export class MockPlayerStatsProvider implements PlayerStatsProvider {
  async getStats(steamId: string, serverId: string): Promise<PlayerStats> {
    return getStoredStats(steamId, serverId) ?? emptyStats(steamId, serverId);
  }
}
