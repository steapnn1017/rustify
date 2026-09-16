import { randomUUID } from "crypto";
import { OxideCarbonRconAdapter, type GrantResult } from "./rcon";
import { CLUSTER_SERVER_ID, grantServerIds, inGameGroups, regionPackId, type StoreTierId } from "@/lib/store/catalog";
import { serverCatalog } from "@/lib/live/catalog";
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

  const grant = await adapter.grant({
    steamId: input.steamId,
    serverId: input.serverId,
    tier: input.tier,
    durationDays: input.durationDays,
  });
  const now = Date.now();
  const current = entitlements.find(
    (item) =>
      item.steamId === input.steamId &&
      item.serverId === input.serverId &&
      item.tier === input.tier &&
      new Date(item.endsAt).getTime() > now,
  );
  if (current) {
    const base = Math.max(now, new Date(current.endsAt).getTime());
    current.endsAt = new Date(base + input.durationDays * 86400000).toISOString();
    current.sourcePurchaseId = input.purchaseId;
    current.grant = grant;
    write(entitlements);
    return current;
  }

  const startsAt = new Date();
  const record: Entitlement = {
    id: randomUUID(),
    steamId: input.steamId,
    serverId: input.serverId,
    tier: input.tier,
    groups: inGameGroups(input.tier),
    startsAt: startsAt.toISOString(),
    endsAt: new Date(startsAt.getTime() + input.durationDays * 86400000).toISOString(),
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
  const region = serverCatalog.find((item) => item.id === serverId)?.region;
  return activeEntitlements(steamId, now).filter((item) => {
    if (item.serverId === serverId) return true;
    if (item.serverId === CLUSTER_SERVER_ID) return true;
    if (region && item.serverId === regionPackId(region)) return true;
    return grantServerIds(item.tier, item.serverId).includes(serverId);
  });
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
