import { loadJson, saveJson } from "@/lib/persist";
import type { PlayerStats } from "./types";

type Store = {
  stats: Record<string, PlayerStats>;
};

const FILE = "player-stats.json";

function key(steamId: string, serverId: string) {
  return `${steamId}:${serverId}`;
}

function read(): Store {
  return loadJson<Store>(FILE, { stats: {} });
}

function write(store: Store) {
  saveJson(FILE, store);
}

export function getStoredStats(steamId: string, serverId: string) {
  return read().stats[key(steamId, serverId)] ?? null;
}

export function saveStats(stats: PlayerStats) {
  const store = read();
  store.stats[key(stats.steamId, stats.serverId)] = stats;
  write(store);
  return stats;
}
