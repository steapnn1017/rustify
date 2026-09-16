import { MockPlayerStatsProvider } from "./mock";
import { getStoredStats, saveStats } from "./store";
import type { PlayerStats, PlayerStatsProvider } from "./types";

export function getStatsProvider(): PlayerStatsProvider {
  return new MockPlayerStatsProvider();
}

export async function getPlayerStats(steamId: string, serverId: string) {
  return getStatsProvider().getStats(steamId, serverId);
}

export function upsertPlayerStats(
  steamId: string,
  serverId: string,
  patch: Partial<Omit<PlayerStats, "steamId" | "serverId" | "kd" | "source">>,
) {
  const current = getStoredStats(steamId, serverId) ?? {
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
    source: "live" as const,
  };
  const kills = patch.kills ?? current.kills;
  const deaths = patch.deaths ?? current.deaths;
  const next: PlayerStats = {
    ...current,
    kills,
    deaths,
    playtimeHours: patch.playtimeHours ?? current.playtimeHours,
    resourcesGathered: patch.resourcesGathered ?? current.resourcesGathered,
    structuresBuilt: patch.structuresBuilt ?? current.structuresBuilt,
    headshots: patch.headshots ?? current.headshots,
    lastSeenAt: patch.lastSeenAt === undefined ? current.lastSeenAt : patch.lastSeenAt,
    steamId,
    serverId,
    source: "live",
    kd: deaths === 0 ? kills : Math.round((kills / deaths) * 100) / 100,
  };
  return saveStats(next);
}

export type { PlayerStats };
