import { loadJson, saveJson } from "@/lib/persist";

export type WhitelistStatus = "pending" | "verified";

export type WhitelistRequest = {
  steamId: string;
  discordId: string;
  discordName: string;
  status: WhitelistStatus;
  createdAt: string;
  updatedAt: string;
};

type Store = {
  requests: Record<string, WhitelistRequest>;
};

const FILE = "whitelist.json";

function read(): Store {
  return loadJson<Store>(FILE, { requests: {} });
}

function write(store: Store) {
  saveJson(FILE, store);
}

export function getWhitelistRequest(steamId: string) {
  return read().requests[steamId] ?? null;
}

export function submitWhitelistRequest(input: {
  steamId: string;
  discordId: string;
  discordName: string;
}) {
  const store = read();
  const existing = store.requests[input.steamId];
  if (existing) return existing;
  const now = new Date().toISOString();
  const next: WhitelistRequest = {
    steamId: input.steamId,
    discordId: input.discordId,
    discordName: input.discordName,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  store.requests[input.steamId] = next;
  write(store);
  return next;
}

export function setWhitelistStatus(steamId: string, status: WhitelistStatus) {
  const store = read();
  const existing = store.requests[steamId];
  if (!existing) return null;
  const next = { ...existing, status, updatedAt: new Date().toISOString() };
  store.requests[steamId] = next;
  write(store);
  return next;
}
