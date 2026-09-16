import { site } from "@/lib/site";

const DISCORD_AUTHORIZE = "https://discord.com/api/oauth2/authorize";
const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";
const DISCORD_ME = "https://discord.com/api/users/@me";

export function discordConfigured() {
  return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
}

export function discordRedirectUri(origin = site.url) {
  return process.env.DISCORD_REDIRECT_URI || `${origin}/api/auth/discord/callback`;
}

export function discordAuthorizeUrl(state: string, origin = site.url) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || "",
    redirect_uri: discordRedirectUri(origin),
    response_type: "code",
    scope: "identify",
    state,
    prompt: "consent",
  });
  return `${DISCORD_AUTHORIZE}?${params.toString()}`;
}

export async function exchangeDiscordCode(code: string, origin = site.url) {
  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || "",
    client_secret: process.env.DISCORD_CLIENT_SECRET || "",
    grant_type: "authorization_code",
    code,
    redirect_uri: discordRedirectUri(origin),
  });
  const tokenResponse = await fetch(DISCORD_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenResponse.ok) {
    throw new Error(`Discord token exchange failed (${tokenResponse.status})`);
  }
  const token = (await tokenResponse.json()) as { access_token: string };
  const meResponse = await fetch(DISCORD_ME, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!meResponse.ok) {
    throw new Error(`Discord profile fetch failed (${meResponse.status})`);
  }
  const me = (await meResponse.json()) as {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
  };
  return {
    id: me.id,
    username: me.username,
    globalName: me.global_name ?? null,
    avatar: me.avatar
      ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=128`
      : null,
  };
}
