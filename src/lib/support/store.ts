import { loadJson, saveJson } from "@/lib/persist";
import { typePrefix } from "./catalog";
import type { SupportNotice, Ticket, TicketMessage, TicketType } from "./types";

type Store = {
  tickets: Record<string, Ticket>;
  notices: SupportNotice[];
};

const FILE = "support.json";

function read(): Store {
  return loadJson<Store>(FILE, { tickets: {}, notices: [] });
}

function write(store: Store) {
  saveJson(FILE, store);
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function newPublicId(type: TicketType) {
  return `${typePrefix[type]}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function getTicket(id: string) {
  const store = read();
  return store.tickets[id] ?? Object.values(store.tickets).find((item) => item.publicId === id) ?? null;
}

export function listTickets(filter: { steamId?: string | null; guestId?: string | null; all?: boolean }) {
  const rows = Object.values(read().tickets);
  const filtered = filter.all
    ? rows
    : rows.filter((ticket) => {
        if (filter.steamId && ticket.steamId === filter.steamId) return true;
        if (filter.guestId && ticket.guestId === filter.guestId) return true;
        return false;
      });
  return filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function saveTicket(ticket: Ticket) {
  const store = read();
  store.tickets[ticket.id] = ticket;
  write(store);
  return ticket;
}

export function addMessage(ticketId: string, message: Omit<TicketMessage, "id">) {
  const ticket = getTicket(ticketId);
  if (!ticket) return null;
  const next: Ticket = {
    ...ticket,
    messages: [...ticket.messages, { ...message, id: uid("msg") }],
    updatedAt: new Date().toISOString(),
  };
  return saveTicket(next);
}

export function closeTicket(ticketId: string) {
  const ticket = getTicket(ticketId);
  if (!ticket) return null;
  const now = new Date().toISOString();
  return saveTicket({
    ...ticket,
    status: "closed",
    closedAt: now,
    updatedAt: now,
  });
}

export function addNotice(notice: Omit<SupportNotice, "id" | "createdAt" | "read">) {
  const store = read();
  const item: SupportNotice = {
    ...notice,
    id: uid("ntc"),
    read: false,
    createdAt: new Date().toISOString(),
  };
  store.notices.unshift(item);
  store.notices = store.notices.slice(0, 200);
  write(store);
  return item;
}

export function listNotices(steamId: string) {
  return read().notices.filter((item) => item.steamId === steamId);
}

export function unreadNoticeCount(steamId: string) {
  return listNotices(steamId).filter((item) => !item.read).length;
}

export function markNoticesRead(steamId: string) {
  const store = read();
  store.notices = store.notices.map((item) =>
    item.steamId === steamId ? { ...item, read: true } : item,
  );
  write(store);
}

export function ticketsMentioningSteam(steamId: string) {
  return Object.values(read().tickets).filter((ticket) =>
    ticket.fields.some((field) => field.value.includes(steamId)),
  );
}
