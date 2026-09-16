import type {
  ClusterSnapshot,
  LiveDataProvider,
  ServerSnapshot,
  ServerSummary,
  VoteOption,
} from "./types";
import { connectFromEnv, currentMap, serverCatalog, sharedRuleset, wipeTimes } from "./catalog";
import { rustMapsCatalog, rustMapsPageUrl } from "./maps";
import { getTally } from "@/lib/votes/store";

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function livePlayers(id: string, max: number, bias: number, at: Date) {
  const t = at.getTime() / 60000;
  const seed = hash(id) / 0xffffffff;
  const wave =
    0.5 +
    0.28 * Math.sin(t / 11 + seed * 6) +
    0.16 * Math.sin(t / 3.4 + seed * 12);
  const value = Math.round(max * Math.min(0.96, Math.max(0.04, bias * 0.7 + wave * 0.45)));
  return value;
}

function voteOptions(slug: string): VoteOption[] {
  const tallies = getTally(slug);
  return rustMapsCatalog.map((map) => {
    const id = `${slug}-${map.id.slice(0, 8)}`;
    return {
      id,
      seed: map.seed,
      size: map.size,
      label: `${map.size} · ${map.seed}`,
      thumbnailUrl: `/maps/${map.slug}.webp`,
      interactiveUrl: rustMapsPageUrl(map.id),
      votes: tallies[id] ?? Math.round(4 + (hash(id) % 18)),
    };
  });
}

function toSummary(at: Date, config: (typeof serverCatalog)[number]): ServerSummary {
  const players = livePlayers(config.id, config.maxPlayers, config.occupancyBias, at);
  const online = true;
  const full = players >= config.maxPlayers;
  const { wipeAt, bpWipeAt } = wipeTimes(config, at);
  return {
    id: config.id,
    slug: config.slug,
    name: config.name,
    kind: config.kind,
    online,
    players,
    maxPlayers: config.maxPlayers,
    queue: full ? 8 + (hash(config.id + at.getUTCHours()) % 24) : 0,
    wipeAt,
    bpWipeAt,
    map: currentMap(config),
    connect: connectFromEnv(config),
    discordChannelUrl: config.discordChannelUrl,
    rulesNotes: config.rulesNotes,
  };
}

export class MockLiveDataProvider implements LiveDataProvider {
  async getServers(): Promise<ServerSummary[]> {
    const at = new Date();
    return serverCatalog.map((config) => toSummary(at, config));
  }

  async getCluster(): Promise<ClusterSnapshot> {
    const servers = await this.getServers();
    const queriedAt = new Date().toISOString();
    const playersOnline = servers.reduce((sum, server) => sum + server.players, 0);
    const serversUp = servers.filter((server) => server.online).length;
    const capacity = servers.reduce((sum, server) => sum + server.maxPlayers, 0);
    const nextWipeAt = servers
      .map((server) => server.wipeAt)
      .sort()[0];
    return {
      queriedAt,
      playersOnline,
      serversUp,
      serversTotal: servers.length,
      nextWipeAt,
      occupancy: capacity === 0 ? 0 : playersOnline / capacity,
      servers,
    };
  }

  async getServer(slug: string): Promise<ServerSnapshot | null> {
    const config = serverCatalog.find((item) => item.slug === slug);
    if (!config) return null;
    const at = new Date();
    const summary = toSummary(at, config);
    return {
      ...summary,
      ruleset: sharedRuleset,
      votes: voteOptions(slug),
      queriedAt: at.toISOString(),
    };
  }
}
