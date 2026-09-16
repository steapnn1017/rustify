import type { TicketType } from "./types";

export type TicketCategory = {
  id: TicketType;
  title: string;
  blurb: string;
  requiresDiscord: boolean;
  accent: string;
};

export const ticketCategories: TicketCategory[] = [
  {
    id: "report",
    title: "Report a Player",
    blurb: "Flag cheating, toxicity, or other rule breaks.",
    requiresDiscord: true,
    accent: "#c45c5c",
  },
  {
    id: "appeal",
    title: "Submit an Appeal",
    blurb: "Appeal a ban, EAC / game ban, or mute.",
    requiresDiscord: true,
    accent: "#c4a574",
  },
  {
    id: "whitelist",
    title: "VPN / Whitelist",
    blurb: "Ask for VPN approval or whitelist access.",
    requiresDiscord: true,
    accent: "#6a8fbf",
  },
  {
    id: "store",
    title: "Store Support",
    blurb: "Purchases, Queue Skip, or missing VIP.",
    requiresDiscord: true,
    accent: "#8a6abf",
  },
  {
    id: "other",
    title: "Something else",
    blurb: "General questions that do not fit the other queues.",
    requiresDiscord: false,
    accent: "#6a8f6a",
  },
];

export function categoryById(id: string) {
  return ticketCategories.find((item) => item.id === id) ?? null;
}

export const typePrefix: Record<TicketType, string> = {
  report: "RPT",
  appeal: "APL",
  whitelist: "WHT",
  store: "STR",
  other: "GEN",
};
