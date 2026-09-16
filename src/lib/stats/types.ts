export type PlayerStats = {
  steamId: string;
  serverId: string;
  kills: number;
  deaths: number;
  kd: number;
  playtimeHours: number;
  resourcesGathered: number;
  structuresBuilt: number;
  headshots: number;
  lastSeenAt: string | null;
  source: "live" | "mock";
};

export interface PlayerStatsProvider {
  getStats(steamId: string, serverId: string): Promise<PlayerStats>;
  setStats?(steamId: string, serverId: string, stats: Partial<PlayerStats>): Promise<PlayerStats>;
}
