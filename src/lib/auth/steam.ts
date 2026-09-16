import { site } from "@/lib/site";
import type { SessionUser } from "./session";

const STEAM_OPENID = "https://steamcommunity.com/openid/login";

export function steamLoginUrl(returnTo = "/", origin = site.url) {
  const callback = new URL("/api/auth/steam/callback", origin);
  callback.searchParams.set("returnTo", safeReturnTo(returnTo));
  const configuredRealm = process.env.STEAM_REALM || "";
  const realm = configuredRealm && origin.startsWith(configuredRealm) ? configuredRealm : origin;
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": callback.toString(),
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID}?${params.toString()}`;
}

export function safeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function extractSteamId(claimedId: string | null) {
  const match = claimedId?.match(/\/id\/(\d{17})/);
  return match?.[1] ?? null;
}

export async function verifySteamAssertion(url: URL) {
  const params = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (key.startsWith("openid.")) params.set(key, value);
  });
  params.set("openid.mode", "check_authentication");
  const response = await fetch(STEAM_OPENID, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const body = await response.text();
  return body.includes("is_valid:true");
}

type SteamSummary = {
  response?: {
    players?: Array<{
      steamid: string;
      personaname: string;
      avatarfull: string;
    }>;
  };
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function xmlTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

async function loadFromSteamApi(steamId: string): Promise<SessionUser | null> {
  const key = process.env.STEAM_API_KEY;
  if (!key) return null;
  const url = new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/");
  url.searchParams.set("key", key);
  url.searchParams.set("steamids", steamId);
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) return null;
  const payload = (await response.json()) as SteamSummary;
  const player = payload.response?.players?.[0];
  if (!player?.personaname) return null;
  return {
    steamId,
    name: player.personaname,
    avatar: player.avatarfull || "",
  };
}

async function loadFromCommunityXml(steamId: string): Promise<SessionUser | null> {
  const response = await fetch(`https://steamcommunity.com/profiles/${steamId}/?xml=1`, {
    headers: { "User-Agent": "RustifyGG/1.0" },
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const xml = await response.text();
  if (xml.includes("<privacyMessage>") || xml.includes("This profile is private")) {
    const name = xmlTag(xml, "steamID") || xmlTag(xml, "steamID64");
    const avatar = xmlTag(xml, "avatarFull") || xmlTag(xml, "avatarMedium");
    if (!name && !avatar) return null;
    return {
      steamId,
      name: name || `Steam ${steamId.slice(-4)}`,
      avatar,
    };
  }
  const name = xmlTag(xml, "steamID");
  const avatar = xmlTag(xml, "avatarFull") || xmlTag(xml, "avatarMedium") || xmlTag(xml, "avatarIcon");
  if (!name) return null;
  return { steamId, name, avatar };
}

export async function loadSteamProfile(steamId: string): Promise<SessionUser> {
  try {
    const fromApi = await loadFromSteamApi(steamId);
    if (fromApi) return fromApi;
  } catch {
    // fall through
  }
  try {
    const fromXml = await loadFromCommunityXml(steamId);
    if (fromXml) return fromXml;
  } catch {
    // fall through
  }
  return {
    steamId,
    name: `Player ${steamId.slice(-4)}`,
    avatar: "",
  };
}

export function isPlaceholderSteamProfile(user: SessionUser) {
  return !user.avatar || /^Player \d{4}$/.test(user.name);
}
