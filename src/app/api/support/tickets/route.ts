import { NextResponse } from "next/server";
import { getGuestId, getOrCreateGuestId } from "@/lib/auth/guest";
import { getSession } from "@/lib/auth/session";
import { isStaffSteam } from "@/lib/staff/access";
import { categoryById } from "@/lib/support/catalog";
import { announceTicket, createTicketRecord } from "@/lib/support/create";
import { listTickets } from "@/lib/support/store";
import type { TicketField, TicketType } from "@/lib/support/types";
import { getUserProfile } from "@/lib/users/store";
import { submitWhitelistRequest } from "@/lib/whitelist/store";

const TYPES: TicketType[] = ["report", "appeal", "whitelist", "store", "other"];

export async function GET() {
  const user = await getSession();
  const guestId = await getGuestId();
  const tickets = isStaffSteam(user?.steamId)
    ? listTickets({ all: true })
    : listTickets({ steamId: user?.steamId, guestId });
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const user = await getSession();
  const body = (await request.json().catch(() => null)) as {
    type?: string;
    title?: string;
    fields?: TicketField[];
    playerName?: string;
  } | null;
  const type = TYPES.find((item) => item === body?.type);
  const category = type ? categoryById(type) : null;
  if (!type || !category) {
    return NextResponse.json({ error: "Unknown ticket type." }, { status: 400 });
  }

  if (category.requiresDiscord) {
    if (!user) return NextResponse.json({ error: "Sign in with Steam first." }, { status: 401 });
    const profile = getUserProfile(user.steamId);
    if (!profile.discord) {
      return NextResponse.json({ error: "Link Discord before opening this ticket." }, { status: 403 });
    }
  }

  const profile = user ? getUserProfile(user.steamId) : null;
  const guestId = user ? null : await getOrCreateGuestId();
  const fields = Array.isArray(body?.fields)
    ? body.fields
        .filter((field) => field && typeof field.key === "string")
        .map((field) => ({
          key: String(field.key).slice(0, 40),
          label: String(field.label || field.key).slice(0, 80),
          value: String(field.value || "").slice(0, 4000),
        }))
    : [];
  if (fields.every((field) => !field.value.trim()) && !body?.title?.trim()) {
    return NextResponse.json({ error: "Add some details before sending." }, { status: 400 });
  }

  const title =
    body?.title?.trim() ||
    fields.find((field) => field.key === "subject")?.value ||
    fields.find((field) => field.key === "target")?.value ||
    category.title;

  const ticket = createTicketRecord({
    type,
    title,
    fields,
    steamId: user?.steamId ?? null,
    guestId,
    discordId: profile?.discord?.id ?? null,
    discordName: profile?.discord?.globalName || profile?.discord?.username || null,
    playerName: user?.name || body?.playerName?.trim() || "Guest",
  });

  if (type === "whitelist" && user && profile?.discord) {
    submitWhitelistRequest({
      steamId: user.steamId,
      discordId: profile.discord.id,
      discordName: profile.discord.globalName || profile.discord.username,
    });
  }

  await announceTicket(origin, ticket);
  return NextResponse.json({ ticket });
}
