import { randomUUID } from "crypto";
import { OxideCarbonRconAdapter, type GrantResult } from "./rcon";
import { CLUSTER_SERVER_ID, inGameGroups, isClusterTier, type StoreTierId } from "@/lib/store/catalog";
import { loadJson, saveJson } from "@/lib/persist";

export type Entitlement = {
  id: string;
  steamId: string;
  serverId: string;
  tier: StoreTierId;
  groups: string[];
  startsAt: string;
  endsAt: string;
  sourcePurchaseId: string;
  grant: GrantResult;
};

const FILE = "entitlements.json";
const adapter = new OxideCarbonRconAdapter();

function read(): Entitlement[] {
  return loadJson<Entitlement[]>(FILE, []);
}

function write(entitlements: Entitlement[]) {
  saveJson(FILE, entitlements);
}

export async function grantEntitlement(input: {
  steamId: string;
  serverId: string;
  tier: StoreTierId;
  durationDays: number;
  purchaseId: string;
}) {
  const entitlements = read();
  const existing = entitlements.find(
    (item) => item.sourcePurchaseId === input.purchaseId && item.steamId === input.steamId,
  );
  if (existing) return existing;

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + input.durationDays * 86400000);
  const grant = await adapter.grant({
    steamId: input.steamId,
    serverId: input.serverId,
    tier: input.tier,
    durationDays: input.durationDays,
  });
  const record: Entitlement = {
    id: randomUUID(),
    steamId: input.steamId,
    serverId: isClusterTier(input.tier) ? CLUSTER_SERVER_ID : input.serverId,
    tier: input.tier,
    groups: inGameGroups(input.tier),
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    sourcePurchaseId: input.purchaseId,
    grant,
  };
  entitlements.unshift(record);
  write(entitlements);
  return record;
}

export function listEntitlements(steamId: string) {
  return read().filter((item) => item.steamId === steamId);
}

export function activeEntitlements(steamId: string, now = Date.now()) {
  return listEntitlements(steamId).filter((item) => new Date(item.endsAt).getTime() > now);
}

export function activeEntitlementsForServer(steamId: string, serverId: string, now = Date.now()) {
  return activeEntitlements(steamId, now).filter(
    (item) => item.serverId === serverId || item.serverId === CLUSTER_SERVER_ID,
  );
}

export function inGameState(steamId: string, serverId: string) {
  const active = activeEntitlementsForServer(steamId, serverId);
  const groups = [...new Set(active.flatMap((item) => item.groups))];
  return {
    steamId,
    serverId,
    groups,
    entitlements: active.map((item) => ({
      id: item.id,
      tier: item.tier,
      groups: item.groups,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
    })),
  };
}
