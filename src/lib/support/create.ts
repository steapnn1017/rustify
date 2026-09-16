import { randomBytes } from "crypto";
import { sendTicketStaffLog } from "@/lib/discord/staff";
import { addMessage, getTicket, newPublicId, saveTicket } from "./store";
import type { Ticket, TicketField, TicketType } from "./types";

const SYSTEM_INTRO: Record<TicketType, string> = {
  report:
    "Thanks — we received the report. Staff will review the SteamIDs, server, and evidence. Extra pings will not speed this up.",
  appeal:
    "Thanks for the appeal. We process these based on the type and history of the account. Adding more tickets will not move you up the queue.",
  whitelist:
    "Whitelist / VPN requests are checked against the Discord-linked Steam account. Staff still has to accept the link review before this is applied.",
  store:
    "Store tickets are checked against the SteamID that paid. Include the invoice or checkout time if you have it.",
  other: "We got it. A moderator will reply here when they have an answer.",
};

export function createTicketRecord(input: {
  type: TicketType;
  title: string;
  fields: TicketField[];
  steamId: string | null;
  guestId: string | null;
  discordId: string | null;
  discordName: string | null;
  playerName: string;
}) {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: randomBytes(8).toString("hex"),
    publicId: newPublicId(input.type),
    type: input.type,
    title: input.title.slice(0, 140),
    status: "open",
    steamId: input.steamId,
    guestId: input.guestId,
    discordId: input.discordId,
    discordName: input.discordName,
    playerName: input.playerName.slice(0, 80) || "Player",
    fields: input.fields.filter((field) => field.value.trim()),
    messages: [],
    createdAt: now,
    updatedAt: now,
    closedAt: null,
  };
  saveTicket(ticket);
  addMessage(ticket.id, {
    author: "system",
    authorName: "System",
    body: SYSTEM_INTRO[input.type],
    createdAt: now,
  });
  return getTicket(ticket.id)!;
}

export async function announceTicket(origin: string, ticket: Ticket) {
  try {
    await sendTicketStaffLog({ origin, ticket });
  } catch {
    // staff log is best-effort
  }
}
