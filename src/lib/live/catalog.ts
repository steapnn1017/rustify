import { site } from "@/lib/site";
import type { Ruleset, ServerKind } from "./types";
import { mapInfo } from "./maps";
import { nextBpWipe, nextMonthlyWipe, nextWeekday } from "./schedule";

export const sharedRuleset: Ruleset = {
  gatherRate: "2×",
  lootRate: "2×",
  lootStack: "Vanilla",
  dayNightRatio: "3:1",
  recyclerInSafeZone: true,
  teamUiLimit: 8,
};

export type ServerConfig = {
  id: string;
  slug: string;
  name: string;
  kind: ServerKind;
  maxPlayers: number;
  seed: number;
  size: number;
  hostEnv: string;
  portEnv: string;
  rconHostEnv: string;
  rconPortEnv: string;
  rconPasswordEnv: string;
  fallbackHost: string;
  fallbackPort: number;
  discordChannelUrl: string;
  rulesNotes: string[];
  occupancyBias: number;
  wipe: "thursday" | "monday" | "monthly";
};

export const serverCatalog: ServerConfig[] = [
  {
    id: "main",
    slug: "main",
    name: "Main 2x",
    kind: "main",
    maxPlayers: 200,
    seed: 608632069,
    size: 4750,
    hostEnv: "SERVER_MAIN_HOST",
    portEnv: "SERVER_MAIN_PORT",
    rconHostEnv: "SERVER_MAIN_RCON_HOST",
    rconPortEnv: "SERVER_MAIN_RCON_PORT",
    rconPasswordEnv: "SERVER_MAIN_RCON_PASSWORD",
    fallbackHost: "203.0.113.11",
    fallbackPort: 28015,
    discordChannelUrl: `${site.discord}`,
    rulesNotes: ["Weekly map wipe Thursday 18:00 CEST.", "Blueprint wipe monthly."],
    occupancyBias: 0.58,
    wipe: "thursday",
  },
  {
    id: "mondays",
    slug: "mondays",
    name: "Mondays 2x",
    kind: "mondays",
    maxPlayers: 150,
    seed: 1464861868,
    size: 4750,
    hostEnv: "SERVER_MONDAYS_HOST",
    portEnv: "SERVER_MONDAYS_PORT",
    rconHostEnv: "SERVER_MONDAYS_RCON_HOST",
    rconPortEnv: "SERVER_MONDAYS_RCON_PORT",
    rconPasswordEnv: "SERVER_MONDAYS_RCON_PASSWORD",
    fallbackHost: "203.0.113.21",
    fallbackPort: 28015,
    discordChannelUrl: `${site.discord}`,
    rulesNotes: ["Map wipe every Monday 18:00 CEST."],
    occupancyBias: 0.36,
    wipe: "monday",
  },
  {
    id: "monthly",
    slug: "monthly",
    name: "Monthly 2x",
    kind: "monthly",
    maxPlayers: 200,
    seed: 1659447160,
    size: 4750,
    hostEnv: "SERVER_MONTHLY_HOST",
    portEnv: "SERVER_MONTHLY_PORT",
    rconHostEnv: "SERVER_MONTHLY_RCON_HOST",
    rconPortEnv: "SERVER_MONTHLY_RCON_PORT",
    rconPasswordEnv: "SERVER_MONTHLY_RCON_PASSWORD",
    fallbackHost: "203.0.113.31",
    fallbackPort: 28015,
    discordChannelUrl: `${site.discord}`,
    rulesNotes: ["Long wipe. Map and BPs drop together on the first Thursday."],
    occupancyBias: 0.22,
    wipe: "monthly",
  },
];

export function connectFromEnv(config: ServerConfig) {
  const host = process.env[config.hostEnv] || config.fallbackHost;
  const port = Number(process.env[config.portEnv] || config.fallbackPort);
  return { host, port };
}

export function rconFromEnv(serverId: string) {
  const config = serverCatalog.find((item) => item.id === serverId);
  if (!config) return null;
  const host = process.env[config.rconHostEnv];
  const password = process.env[config.rconPasswordEnv];
  if (!host || !password) return null;
  return {
    host,
    port: Number(process.env[config.rconPortEnv] || 28016),
    password,
  };
}

export function wipeTimes(config: ServerConfig, from = new Date()) {
  if (config.wipe === "monday") {
    const wipeAt = nextWeekday(1, 16, from).toISOString();
    return { wipeAt, bpWipeAt: nextBpWipe(from).toISOString() };
  }
  if (config.wipe === "monthly") {
    const wipeAt = nextMonthlyWipe(4, 16, from).toISOString();
    return { wipeAt, bpWipeAt: wipeAt };
  }
  const wipeAt = nextWeekday(4, 16, from).toISOString();
  return { wipeAt, bpWipeAt: nextBpWipe(from).toISOString() };
}

export function currentMap(config: ServerConfig) {
  return mapInfo(config.slug);
}
