import { site } from "@/lib/site";
import { signReviewToken } from "@/lib/staff/token";
import type { DiscordLink } from "@/lib/users/store";
import type { Ticket } from "@/lib/support/types";

type WebhookPayload = {
  username?: string;
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: { text: string };
  }>;
  components?: Array<{
    type: 1;
    components: Array<{ type: 2; style: 5; label: string; url: string }>;
  }>;
};

async function postWebhook(payload: WebhookPayload) {
  const url = process.env.DISCORD_STAFF_WEBHOOK_URL;
  if (!url) return false;
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: payload.username || "Rustify Support",
      ...payload,
    }),
  });
  return response.ok;
}

export async function sendDiscordReviewLog(input: {
  origin: string;
  steamId: string;
  steamName: string;
  discord: DiscordLink;
  flags: string[];
  summary: string;
}) {
  const token = signReviewToken({ kind: "discord", steamId: input.steamId });
  const accept = new URL("/api/staff/review", input.origin);
  accept.searchParams.set("t", token);
  accept.searchParams.set("v", "accept");
  const reject = new URL("/api/staff/review", input.origin);
  reject.searchParams.set("t", token);
  reject.searchParams.set("v", "reject");
  const flagged = input.flags.length > 0;
  return postWebhook({
    content: flagged ? "Possible risk on a newly linked account." : "New Discord link — no Steam bans found.",
    embeds: [
      {
        title: flagged ? "Discord link — review needed" : "Discord link — looks clean",
        color: flagged ? 0xc45c5c : 0x6a8f6a,
        fields: [
          {
            name: "Steam",
            value: `[${input.steamName}](https://steamcommunity.com/profiles/${input.steamId})\n\`${input.steamId}\``,
            inline: true,
          },
          {
            name: "Discord",
            value: `<@${input.discord.id}>\n${input.discord.globalName || input.discord.username}`,
            inline: true,
          },
          {
            name: "Screening",
            value: input.summary.slice(0, 1000) || "No flags.",
          },
        ],
        footer: { text: site.name },
      },
    ],
    components: [
      {
        type: 1,
        components: [
          { type: 2, style: 5, label: "Accept", url: accept.toString() },
          { type: 2, style: 5, label: "Reject", url: reject.toString() },
        ],
      },
    ],
  });
}

export async function sendTicketStaffLog(input: { origin: string; ticket: Ticket }) {
  const url = new URL(`/support/tickets/${input.ticket.id}`, input.origin);
  const fields = input.ticket.fields
    .slice(0, 6)
    .map((field) => ({
      name: field.label.slice(0, 80),
      value: (field.value || "—").slice(0, 400),
    }));
  return postWebhook({
    content: `New ${input.ticket.type} ticket \`${input.ticket.publicId}\``,
    embeds: [
      {
        title: input.ticket.title.slice(0, 120),
        color: 0x8a8a8a,
        fields: [
          {
            name: "Player",
            value: input.ticket.steamId
              ? `[${input.ticket.playerName}](https://steamcommunity.com/profiles/${input.ticket.steamId})`
              : input.ticket.playerName,
            inline: true,
          },
          {
            name: "Discord",
            value: input.ticket.discordId
              ? `<@${input.ticket.discordId}> ${input.ticket.discordName || ""}`
              : "Not linked",
            inline: true,
          },
          ...fields,
        ],
        footer: { text: input.ticket.publicId },
      },
    ],
    components: [
      {
        type: 1,
        components: [{ type: 2, style: 5, label: "Open ticket", url: url.toString() }],
      },
    ],
  });
}

export async function sendDiscordDm(discordId: string, content: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return false;
  const open = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: discordId }),
  });
  if (!open.ok) return false;
  const channel = (await open.json()) as { id?: string };
  if (!channel.id) return false;
  const sent = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  return sent.ok;
}
