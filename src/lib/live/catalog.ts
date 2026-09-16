import { site } from "@/lib/site";
import type { Ruleset, ServerKind, ServerRegion } from "./types";
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

export const clusterRegions: { id: ServerRegion; label: string; flag: string }[] = [
  { id: "eu", label: "Europe", flag: "/flags/eu.svg" },
  { id: "us", label: "United States", flag: "/flags/us.svg" },
];

export const clusterKinds: { id: ServerKind; label: string; blurb: string }[] = [
  { id: "main", label: "Main", blurb: "Weekly Thursday wipe. The busiest 2x vanilla map." },
  { id: "mondays", label: "Mondays", blurb: "Fresh map every Monday. Shorter cycle, more fights." },
  { id: "monthly", label: "Monthly", blurb: "Long wipe. Map and blueprints drop together." },
  { id: "sdt", label: "Solo / Duo / Trio", blurb: "Group limit of 3. Built for small teams." },
];

export type ServerConfig = {
  id: string;
  slug: string;
  name: string;
  kind: ServerKind;
  region: ServerRegion;
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

function defineServer(
  region: ServerRegion,
  kind: ServerKind,
  extra: Pick<ServerConfig, "id" | "slug" | "hostEnv" | "portEnv" | "rconHostEnv" | "rconPortEnv" | "rconPasswordEnv" | "fallbackHost" | "occupancyBias" | "wipe" | "rulesNotes" | "maxPlayers" | "seed">,
): ServerConfig {
  const name = clusterKinds.find((item) => item.id === kind)?.label ?? kind;
  return {
    ...extra,
    name,
    kind,
    region,
    size: 4750,
    fallbackPort: 28015,
    discordChannelUrl: site.discord,
  };
}

export const serverCatalog: ServerConfig[] = [
  defineServer("eu", "main", {
    id: "main",
    slug: "main",
    maxPlayers: 200,
    seed: 608632069,
    hostEnv: "SERVER_MAIN_HOST",
    portEnv: "SERVER_MAIN_PORT",
    rconHostEnv: "SERVER_MAIN_RCON_HOST",
    rconPortEnv: "SERVER_MAIN_RCON_PORT",
    rconPasswordEnv: "SERVER_MAIN_RCON_PASSWORD",
    fallbackHost: "203.0.113.11",
    occupancyBias: 0.58,
    wipe: "thursday",
    rulesNotes: ["Weekly map wipe Thursday 18:00 CEST.", "Blueprint wipe monthly."],
  }),
  defineServer("eu", "mondays", {
    id: "mondays",
    slug: "mondays",
    maxPlayers: 150,
    seed: 1464861868,
    hostEnv: "SERVER_MONDAYS_HOST",
    portEnv: "SERVER_MONDAYS_PORT",
    rconHostEnv: "SERVER_MONDAYS_RCON_HOST",
    rconPortEnv: "SERVER_MONDAYS_RCON_PORT",
    rconPasswordEnv: "SERVER_MONDAYS_RCON_PASSWORD",
    fallbackHost: "203.0.113.21",
    occupancyBias: 0.36,
    wipe: "monday",
    rulesNotes: ["Map wipe every Monday 18:00 CEST."],
  }),
  defineServer("eu", "monthly", {
    id: "monthly",
    slug: "monthly",
    maxPlayers: 200,
    seed: 1659447160,
    hostEnv: "SERVER_MONTHLY_HOST",
    portEnv: "SERVER_MONTHLY_PORT",
    rconHostEnv: "SERVER_MONTHLY_RCON_HOST",
    rconPortEnv: "SERVER_MONTHLY_RCON_PORT",
    rconPasswordEnv: "SERVER_MONTHLY_RCON_PASSWORD",
    fallbackHost: "203.0.113.31",
    occupancyBias: 0.22,
    wipe: "monthly",
    rulesNotes: ["Long wipe. Map and BPs drop together on the first Thursday."],
  }),
  defineServer("eu", "sdt", {
    id: "eu-sdt",
    slug: "eu-sdt",
    maxPlayers: 150,
    seed: 608632069,
    hostEnv: "SERVER_EU_SDT_HOST",
    portEnv: "SERVER_EU_SDT_PORT",
    rconHostEnv: "SERVER_EU_SDT_RCON_HOST",
    rconPortEnv: "SERVER_EU_SDT_RCON_PORT",
    rconPasswordEnv: "SERVER_EU_SDT_RCON_PASSWORD",
    fallbackHost: "203.0.113.41",
    occupancyBias: 0.3,
    wipe: "thursday",
    rulesNotes: ["Group limit 3. Weekly map wipe Thursday 18:00 CEST."],
  }),
  defineServer("us", "main", {
    id: "us-main",
    slug: "us-main",
    maxPlayers: 200,
    seed: 608632069,
    hostEnv: "SERVER_US_MAIN_HOST",
    portEnv: "SERVER_US_MAIN_PORT",
    rconHostEnv: "SERVER_US_MAIN_RCON_HOST",
    rconPortEnv: "SERVER_US_MAIN_RCON_PORT",
    rconPasswordEnv: "SERVER_US_MAIN_RCON_PASSWORD",
    fallbackHost: "203.0.113.51",
    occupancyBias: 0.48,
    wipe: "thursday",
    rulesNotes: ["Weekly map wipe Thursday 12:00 EST.", "Blueprint wipe monthly."],
  }),
  defineServer("us", "mondays", {
    id: "us-mondays",
    slug: "us-mondays",
    maxPlayers: 150,
    seed: 1464861868,
    hostEnv: "SERVER_US_MONDAYS_HOST",
    portEnv: "SERVER_US_MONDAYS_PORT",
    rconHostEnv: "SERVER_US_MONDAYS_RCON_HOST",
    rconPortEnv: "SERVER_US_MONDAYS_RCON_PORT",
    rconPasswordEnv: "SERVER_US_MONDAYS_RCON_PASSWORD",
    fallbackHost: "203.0.113.61",
    occupancyBias: 0.32,
    wipe: "monday",
    rulesNotes: ["Map wipe every Monday 12:00 EST."],
  }),
  defineServer("us", "monthly", {
    id: "us-monthly",
    slug: "us-monthly",
    maxPlayers: 200,
    seed: 1659447160,
    hostEnv: "SERVER_US_MONTHLY_HOST",
    portEnv: "SERVER_US_MONTHLY_PORT",
    rconHostEnv: "SERVER_US_MONTHLY_RCON_HOST",
    rconPortEnv: "SERVER_US_MONTHLY_RCON_PORT",
    rconPasswordEnv: "SERVER_US_MONTHLY_RCON_PASSWORD",
    fallbackHost: "203.0.113.71",
    occupancyBias: 0.2,
    wipe: "monthly",
    rulesNotes: ["Long wipe. Map and BPs drop together on the first Thursday."],
  }),
  defineServer("us", "sdt", {
    id: "us-sdt",
    slug: "us-sdt",
    maxPlayers: 150,
    seed: 608632069,
    hostEnv: "SERVER_US_SDT_HOST",
    portEnv: "SERVER_US_SDT_PORT",
    rconHostEnv: "SERVER_US_SDT_RCON_HOST",
    rconPortEnv: "SERVER_US_SDT_RCON_PORT",
    rconPasswordEnv: "SERVER_US_SDT_RCON_PASSWORD",
    fallbackHost: "203.0.113.81",
    occupancyBias: 0.26,
    wipe: "thursday",
    rulesNotes: ["Group limit 3. Weekly map wipe Thursday 12:00 EST."],
  }),
];

export function regionCode(region: ServerRegion) {
  return region === "us" ? "US" : "EU";
}

export function regionName(region: ServerRegion) {
  return region === "us" ? "United States" : "Europe";
}

export function regionFlag(region: ServerRegion) {
  return region === "us" ? "/flags/us.svg" : "/flags/eu.svg";
}

export function serverHeadline(input: { region: ServerRegion; name: string }) {
  return `[${regionCode(input.region)}] Rustify ${input.name}`;
}

export function findClusterServer(region: ServerRegion, kind: ServerKind) {
  return serverCatalog.find((item) => item.region === region && item.kind === kind) ?? null;
}

export function rulesetFor(config: ServerConfig): Ruleset {
  return { ...sharedRuleset, teamUiLimit: config.kind === "sdt" ? 3 : 8 };
}

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
  const key = config.kind === "mondays" ? "mondays" : config.kind === "monthly" ? "monthly" : "main";
  return mapInfo(key);
}
