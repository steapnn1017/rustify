import { regionCode, regionName, serverCatalog, serverHeadline, type ServerConfig } from "@/lib/live/catalog";
import type { ServerRegion } from "@/lib/live/types";

export type StoreTierId = "queue_skip" | "vip" | "region_vip";
export type StoreScope = "server" | "region";

export const CLUSTER_SERVER_ID = "cluster";
export const REGION_PREFIX = "region:";

export type StoreTier = {
  id: StoreTierId;
  name: string;
  priceCents: number;
  durationDays: number;
  scope: StoreScope;
  summary: string;
  benefits: string[];
};

export const storeTiers: StoreTier[] = [
  {
    id: "queue_skip",
    name: "Queue Skip",
    priceCents: 500,
    durationDays: 30,
    scope: "server",
    summary: "Skip the connection queue on this server only.",
    benefits: [
      "Bound to the Steam account you pay with",
      "Queue skip on this server",
      "Priority reconnect after a crash",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    priceCents: 1000,
    durationDays: 30,
    scope: "server",
    summary: "Queue skip plus skin box on this server.",
    benefits: [
      "Bound to the Steam account you pay with",
      "Queue skip on this server",
      "Skin box",
      "Reserved slot when the server is full",
    ],
  },
  {
    id: "region_vip",
    name: "Region VIP",
    priceCents: 2500,
    durationDays: 30,
    scope: "region",
    summary: "VIP on every Rustify box in one region.",
    benefits: [
      "Bound to the Steam account you pay with",
      "Queue skip on every server in that region",
      "Skin box on every server in that region",
      "Reserved slot when those servers are full",
    ],
  },
];

export function getTier(id: string) {
  if (id === "pro") return storeTiers.find((tier) => tier.id === "region_vip") ?? null;
  return storeTiers.find((tier) => tier.id === id) ?? null;
}

export function inGameGroups(tier: string) {
  if (tier === "queue_skip") return ["queueskip"];
  return ["queueskip", "skinbox", "reserved"];
}

export function isRegionTier(tier: string) {
  return tier === "region_vip" || tier === "pro";
}

export function regionPackId(region: ServerRegion) {
  return `${REGION_PREFIX}${region}`;
}

export function regionFromPackId(serverId: string): ServerRegion | null {
  if (!serverId.startsWith(REGION_PREFIX)) return null;
  const value = serverId.slice(REGION_PREFIX.length);
  return value === "us" || value === "eu" ? value : null;
}

export function grantServerIds(tier: string, serverId: string) {
  if (isRegionTier(tier)) {
    const region = regionFromPackId(serverId) ?? serverCatalog.find((item) => item.id === serverId)?.region;
    if (!region) return [serverId];
    return serverCatalog.filter((item) => item.region === region).map((item) => item.id);
  }
  if (serverId === CLUSTER_SERVER_ID) return serverCatalog.map((item) => item.id);
  return [serverId];
}

export function appliesToLabel(tier: string, server: Pick<ServerConfig, "region" | "name"> | { region: ServerRegion; name: string }) {
  if (isRegionTier(tier)) return `All ${regionName(server.region)} servers`;
  return serverHeadline(server);
}

export function productTitle(tier: StoreTier, server: Pick<ServerConfig, "region" | "name">) {
  if (tier.scope === "region") return `${regionCode(server.region)} Region VIP`;
  return `${regionCode(server.region)} ${server.name} ${tier.name}`;
}

export function entitlementScopeLabel(serverId: string) {
  const region = regionFromPackId(serverId);
  if (region) return `All ${regionName(region)} servers`;
  if (serverId === CLUSTER_SERVER_ID) return "All servers";
  const server = serverCatalog.find((item) => item.id === serverId);
  return server ? serverHeadline(server) : serverId;
}
