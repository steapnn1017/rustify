import { NextResponse } from "next/server";
import { getGuestId } from "@/lib/auth/guest";
import { getSession } from "@/lib/auth/session";
import { isStaffSteam } from "@/lib/staff/access";
import { addMessage, closeTicket, getTicket } from "@/lib/support/store";
import { notifyPlayer } from "@/lib/support/screen";

function canAccess(ticket: NonNullable<ReturnType<typeof getTicket>>, steamId: string | null, guestId: string | null) {
  if (isStaffSteam(steamId)) return true;
  if (steamId && ticket.steamId === steamId) return true;
  if (guestId && ticket.guestId === guestId) return true;
  return false;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  const guestId = await getGuestId();
  const ticket = getTicket(id);
  if (!ticket) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!canAccess(ticket, user?.steamId ?? null, guestId)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ ticket, staff: isStaffSteam(user?.steamId) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  const guestId = await getGuestId();
  const ticket = getTicket(id);
  if (!ticket) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!canAccess(ticket, user?.steamId ?? null, guestId)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const body = (await request.json().catch(() => null)) as { body?: string; close?: boolean } | null;
  const staff = isStaffSteam(user?.steamId);
  if (body?.close) {
    if (!staff && ticket.status === "open") {
      const closed = closeTicket(ticket.id);
      if (closed) {
        addMessage(ticket.id, {
          author: "system",
          authorName: "System",
          body: "The player closed this ticket.",
          createdAt: new Date().toISOString(),
        });
      }
      return NextResponse.json({ ticket: getTicket(ticket.id) });
    }
    if (staff) {
      closeTicket(ticket.id);
      addMessage(ticket.id, {
        author: "system",
        authorName: "System",
        body: "Staff closed this ticket.",
        createdAt: new Date().toISOString(),
      });
      if (ticket.steamId) {
        await notifyPlayer({
          steamId: ticket.steamId,
          title: "Ticket closed",
          body: `${ticket.publicId} was closed by staff.`,
          href: `/support/tickets/${ticket.id}`,
        });
      }
      return NextResponse.json({ ticket: getTicket(ticket.id) });
    }
  }

  const text = body?.body?.trim() || "";
  if (text.length < 2) return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
  if (ticket.status === "closed") {
    return NextResponse.json({ error: "This ticket is closed." }, { status: 400 });
  }

  const updated = addMessage(ticket.id, {
    author: staff ? "staff" : "user",
    authorName: staff ? "Staff" : user?.name || ticket.playerName,
    body: text.slice(0, 4000),
    createdAt: new Date().toISOString(),
  });

  if (staff && ticket.steamId) {
    await notifyPlayer({
      steamId: ticket.steamId,
      title: "Staff replied",
      body: `New reply on ${ticket.publicId}.`,
      href: `/support/tickets/${ticket.id}`,
    });
  }

  return NextResponse.json({ ticket: updated });
}
