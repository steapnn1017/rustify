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
  scientists?: number;
  gambling?: number;
  raiding?: number;
  events?: number;
  puzzles?: number;
  bought?: number;
  looting?: number;
  lastSeenAt: string | null;
  source: "live" | "mock";
};

export type LeaderboardEntry = PlayerStats & {
  name: string;
  avatar: string;
  rank: number;
};

export interface PlayerStatsProvider {
  getStats(steamId: string, serverId: string): Promise<PlayerStats>;
  setStats?(steamId: string, serverId: string, stats: Partial<PlayerStats>): Promise<PlayerStats>;
}
