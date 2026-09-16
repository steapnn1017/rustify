export type SteamReputation = {
  vacBanned: boolean;
  numberOfVacBans: number;
  numberOfGameBans: number;
  communityBanned: boolean;
  economyBan: string;
  limited: boolean;
  daysSinceLastBan: number | null;
  source: "api" | "xml" | "none";
};

function xmlTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : "";
}

async function fromApi(steamId: string): Promise<SteamReputation | null> {
  const key = process.env.STEAM_API_KEY;
  if (!key) return null;
  const url = new URL("https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/");
  url.searchParams.set("key", key);
  url.searchParams.set("steamids", steamId);
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    players?: Array<{
      VACBanned?: boolean;
      NumberOfVACBans?: number;
      NumberOfGameBans?: number;
      CommunityBanned?: boolean;
      EconomyBan?: string;
      DaysSinceLastBan?: number;
    }>;
  };
  const player = payload.players?.[0];
  if (!player) return null;
  return {
    vacBanned: Boolean(player.VACBanned),
    numberOfVacBans: player.NumberOfVACBans ?? 0,
    numberOfGameBans: player.NumberOfGameBans ?? 0,
    communityBanned: Boolean(player.CommunityBanned),
    economyBan: player.EconomyBan || "none",
    limited: false,
    daysSinceLastBan: player.DaysSinceLastBan ?? null,
    source: "api",
  };
}

async function fromXml(steamId: string): Promise<SteamReputation | null> {
  const response = await fetch(`https://steamcommunity.com/profiles/${steamId}/?xml=1`, {
    headers: { "User-Agent": "RustifyGG/1.0" },
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const xml = await response.text();
  return {
    vacBanned: xmlTag(xml, "vacBanned") === "1",
    numberOfVacBans: xmlTag(xml, "vacBanned") === "1" ? 1 : 0,
    numberOfGameBans: 0,
    communityBanned: false,
    economyBan: xmlTag(xml, "tradeBanState") || "none",
    limited: xmlTag(xml, "isLimitedAccount") === "1",
    daysSinceLastBan: null,
    source: "xml",
  };
}

export async function loadSteamReputation(steamId: string): Promise<SteamReputation> {
  try {
    const api = await fromApi(steamId);
    if (api) {
      try {
        const xml = await fromXml(steamId);
        if (xml) return { ...api, limited: xml.limited };
      } catch {
        return api;
      }
      return api;
    }
  } catch {
    // fall through
  }
  try {
    const xml = await fromXml(steamId);
    if (xml) return xml;
  } catch {
    // fall through
  }
  return {
    vacBanned: false,
    numberOfVacBans: 0,
    numberOfGameBans: 0,
    communityBanned: false,
    economyBan: "none",
    limited: false,
    daysSinceLastBan: null,
    source: "none",
  };
}

export function reputationFlags(rep: SteamReputation) {
  const flags: string[] = [];
  if (rep.vacBanned || rep.numberOfVacBans > 0) {
    flags.push(rep.numberOfVacBans > 1 ? `VAC bans: ${rep.numberOfVacBans}` : "VAC banned");
  }
  if (rep.numberOfGameBans > 0) flags.push(`Game bans: ${rep.numberOfGameBans}`);
  if (rep.communityBanned) flags.push("Steam community ban");
  if (rep.economyBan && rep.economyBan.toLowerCase() !== "none") flags.push(`Economy ban: ${rep.economyBan}`);
  if (rep.limited) flags.push("Limited Steam account");
  if (rep.daysSinceLastBan && rep.daysSinceLastBan > 0 && (rep.vacBanned || rep.numberOfGameBans > 0)) {
    flags.push(`Last ban ${rep.daysSinceLastBan} days ago`);
  }
  return flags;
}
