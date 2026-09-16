export type TicketType = "report" | "appeal" | "whitelist" | "store" | "other";

export type TicketStatus = "open" | "closed";

export type TicketAuthor = "user" | "staff" | "system";

export type TicketField = {
  key: string;
  label: string;
  value: string;
};

export type TicketMessage = {
  id: string;
  author: TicketAuthor;
  authorName: string;
  body: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  publicId: string;
  type: TicketType;
  title: string;
  status: TicketStatus;
  steamId: string | null;
  guestId: string | null;
  discordId: string | null;
  discordName: string | null;
  playerName: string;
  fields: TicketField[];
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

export type DiscordReviewStatus = "pending" | "accepted" | "rejected";

export type DiscordReview = {
  status: DiscordReviewStatus;
  flags: string[];
  summary: string;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
};

export type NotificationPrefs = {
  discordDm: boolean;
  browser: boolean;
};

export type SupportNotice = {
  id: string;
  steamId: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};
