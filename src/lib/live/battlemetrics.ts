import type { ClusterSnapshot, LiveDataProvider, ServerSnapshot, ServerSummary } from "./types";
import { MockLiveDataProvider } from "./mock";
import { connectFromEnv, currentMap, rulesetFor, serverCatalog, wipeTimes } from "./catalog";

/**
 * Swap-in provider. Maps BattleMetrics server payloads onto the same
 * ClusterSnapshot / ServerSnapshot contracts as the mock layer.
 * Activate with LIVE_DATA_PROVIDER=battlemetrics and BATTLEMETRICS_TOKEN.
 */
type BattleMetricsServer = {
  data?: {
    id: string;
    attributes?: {
      name?: string;
      players?: number;
      maxPlayers?: number;
      status?: string;
      details?: { map?: string };
    };
  };
};

function envId(slug: string) {
  return process.env[`BATTLEMETRICS_SERVER_${slug.replace("-", "_").toUpperCase()}`];
}

export class BattleMetricsProvider implements LiveDataProvider {
  private fallback = new MockLiveDataProvider();

  private async fetchServer(id: string): Promise<BattleMetricsServer> {
    const token = process.env.BATTLEMETRICS_TOKEN;
    if (!token) {
      throw new Error("BATTLEMETRICS_TOKEN is not set");
    }
    const response = await fetch(`https://api.battlemetrics.com/servers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 15 },
    });
    if (!response.ok) {
      throw new Error(`BattleMetrics ${response.status}`);
    }
    return response.json() as Promise<BattleMetricsServer>;
  }

  async getServers(): Promise<ServerSummary[]> {
    const token = process.env.BATTLEMETRICS_TOKEN;
    if (!token) return this.fallback.getServers();

    const at = new Date();
    return Promise.all(
      serverCatalog.map(async (config) => {
        const remoteId = envId(config.slug);
        if (!remoteId) {
          return (await this.fallback.getServer(config.slug)) as ServerSummary;
        }
        try {
          const payload = await this.fetchServer(remoteId);
          const attributes = payload.data?.attributes;
          const players = attributes?.players ?? 0;
          const maxPlayers = attributes?.maxPlayers ?? config.maxPlayers;
          const { wipeAt, bpWipeAt } = wipeTimes(config, at);
          return {
            id: config.id,
            slug: config.slug,
            name: config.name,
            kind: config.kind,
            region: config.region,
            online: attributes?.status === "online",
            players,
            maxPlayers,
            queue: players >= maxPlayers ? 1 : 0,
            wipeAt,
            bpWipeAt,
            map: currentMap(config),
            connect: connectFromEnv(config),
            discordChannelUrl: config.discordChannelUrl,
            rulesNotes: config.rulesNotes,
          } satisfies ServerSummary;
        } catch {
          return (await this.fallback.getServer(config.slug)) as ServerSummary;
        }
      }),
    );
  }

  async getCluster(): Promise<ClusterSnapshot> {
    const servers = await this.getServers();
    const playersOnline = servers.reduce((sum, server) => sum + server.players, 0);
    const serversUp = servers.filter((server) => server.online).length;
    const capacity = servers.reduce((sum, server) => sum + server.maxPlayers, 0);
    return {
      queriedAt: new Date().toISOString(),
      playersOnline,
      serversUp,
      serversTotal: servers.length,
      nextWipeAt: servers.map((server) => server.wipeAt).sort()[0],
      occupancy: capacity === 0 ? 0 : playersOnline / capacity,
      servers,
    };
  }

  async getServer(slug: string): Promise<ServerSnapshot | null> {
    const config = serverCatalog.find((item) => item.slug === slug);
    if (!config) return null;
    const summary = (await this.getServers()).find((item) => item.slug === slug);
    if (!summary) return null;
    const fallback = await this.fallback.getServer(slug);
    return {
      ...summary,
      ruleset: rulesetFor(config),
      votes: fallback?.votes ?? [],
      queriedAt: new Date().toISOString(),
    };
  }
}
