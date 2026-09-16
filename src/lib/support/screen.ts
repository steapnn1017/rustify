import type { SessionUser } from "@/lib/auth/session";
import { sendDiscordDm, sendDiscordReviewLog } from "@/lib/discord/staff";
import { loadSteamReputation, reputationFlags } from "@/lib/steam/reputation";
import { addNotice, ticketsMentioningSteam } from "@/lib/support/store";
import type { DiscordReview } from "@/lib/support/types";
import { getUserProfile, setDiscordReview, type DiscordLink } from "@/lib/users/store";
import { getWhitelistRequest } from "@/lib/whitelist/store";

export async function screenLinkedAccount(input: {
  origin: string;
  user: SessionUser;
  discord: DiscordLink;
}) {
  const rep = await loadSteamReputation(input.user.steamId);
  const flags = reputationFlags(rep);
  const mentioned = ticketsMentioningSteam(input.user.steamId).filter((ticket) => ticket.type === "report");
  if (mentioned.length > 0) flags.push(`Named in ${mentioned.length} player report(s)`);
  const whitelist = getWhitelistRequest(input.user.steamId);
  if (whitelist?.status === "pending") flags.push("Open whitelist request");

  const summary = flags.length
    ? flags.join(" · ")
    : `No VAC, game, community, or trade bans found (${rep.source === "none" ? "limited lookup" : rep.source}).`;

  const review: DiscordReview = {
    status: "pending",
    flags,
    summary,
    createdAt: new Date().toISOString(),
    decidedAt: null,
    decidedBy: null,
  };
  setDiscordReview(input.user.steamId, review);
  await sendDiscordReviewLog({
    origin: input.origin,
    steamId: input.user.steamId,
    steamName: input.user.name,
    discord: input.discord,
    flags,
    summary,
  });
  return review;
}

export async function notifyPlayer(input: {
  steamId: string;
  title: string;
  body: string;
  href: string;
}) {
  addNotice({
    steamId: input.steamId,
    title: input.title,
    body: input.body,
    href: input.href,
  });
  const profile = getUserProfile(input.steamId);
  if (profile.notifications.discordDm && profile.discord) {
    await sendDiscordDm(profile.discord.id, `**${input.title}**\n${input.body}`);
  }
}
