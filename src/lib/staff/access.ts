export function isStaffSteam(steamId: string | null | undefined) {
  if (!steamId) return false;
  const raw = process.env.STAFF_STEAM_IDS || "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(steamId);
}

export function staffWebhookConfigured() {
  return Boolean(process.env.DISCORD_STAFF_WEBHOOK_URL);
}

export function discordBotConfigured() {
  return Boolean(process.env.DISCORD_BOT_TOKEN);
}
