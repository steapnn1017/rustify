export type StoreTierId = "queue_skip" | "vip" | "pro";
export type StoreScope = "server" | "cluster";

export const CLUSTER_SERVER_ID = "cluster";

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
    priceCents: 499,
    durationDays: 30,
    scope: "server",
    summary: "Join the box when the queue is stacked.",
    benefits: [
      "Bound to the Steam account you check out with",
      "Applied in-game to that SteamID64 on this server only",
      "Skip the connection queue",
      "Priority reconnect after a crash",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    priceCents: 999,
    durationDays: 30,
    scope: "server",
    summary: "Queue skip, skin box, and a reserved slot on this server.",
    benefits: [
      "Bound to the Steam account you check out with",
      "Applied in-game to that SteamID64 on this server only",
      "Queue Skip on this server",
      "Skin box",
      "Reserved slot when the server is full",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 1999,
    durationDays: 30,
    scope: "cluster",
    summary: "Queue skip on every Rustify box, plus skin box.",
    benefits: [
      "Bound to the Steam account you check out with",
      "Queue Skip on Main 2x, Mondays 2x, and Monthly 2x",
      "Skin box",
    ],
  },
];

export function getTier(id: string) {
  return storeTiers.find((tier) => tier.id === id) ?? null;
}

export function inGameGroups(tier: StoreTierId) {
  if (tier === "queue_skip") return ["queueskip"];
  if (tier === "vip") return ["queueskip", "skinbox", "reserved"];
  return ["queueskip", "skinbox"];
}

export function isClusterTier(tier: StoreTierId) {
  return getTier(tier)?.scope === "cluster";
}

export function appliesToLabel(tier: StoreTierId, serverName: string) {
  if (isClusterTier(tier)) return "Main 2x, Mondays 2x, and Monthly 2x";
  return serverName;
}
