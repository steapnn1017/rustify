export type ServerRegion = "eu" | "us";
export type ServerKind = "main" | "mondays" | "monthly" | "sdt";

export type MapInfo = {
  name: string;
  seed: number;
  size: number;
  rustMapsId: string;
  thumbnailUrl: string;
  imageUrl: string;
  interactiveUrl: string;
};

export type ConnectInfo = {
  host: string;
  port: number;
};

export type Ruleset = {
  gatherRate: string;
  lootRate: string;
  lootStack: string;
  dayNightRatio: string;
  recyclerInSafeZone: boolean;
  teamUiLimit: number;
};

export type VoteOption = {
  id: string;
  seed: number;
  size: number;
  votes: number;
  label: string;
  thumbnailUrl: string;
  interactiveUrl: string;
};

export type ServerSummary = {
  id: string;
  slug: string;
  name: string;
  kind: ServerKind;
  region: ServerRegion;
  online: boolean;
  players: number;
  maxPlayers: number;
  queue: number;
  wipeAt: string;
  bpWipeAt: string;
  map: MapInfo;
  connect: ConnectInfo;
  discordChannelUrl: string;
  rulesNotes: string[];
};

export type ServerSnapshot = ServerSummary & {
  ruleset: Ruleset;
  votes: VoteOption[];
  queriedAt: string;
};

export type ClusterSnapshot = {
  queriedAt: string;
  playersOnline: number;
  serversUp: number;
  serversTotal: number;
  nextWipeAt: string;
  occupancy: number;
  servers: ServerSummary[];
};

export interface LiveDataProvider {
  getCluster(): Promise<ClusterSnapshot>;
  getServer(slug: string): Promise<ServerSnapshot | null>;
  getServers(): Promise<ServerSummary[]>;
}
