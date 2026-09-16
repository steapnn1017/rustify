import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketThread } from "@/components/support/TicketThread";
import { getGuestId } from "@/lib/auth/guest";
import { getFreshSession } from "@/lib/auth/refresh";
import { isStaffSteam } from "@/lib/staff/access";
import { getTicket } from "@/lib/support/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ticket",
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = getTicket(id);
  if (!ticket) notFound();
  const user = await getFreshSession();
  const guestId = await getGuestId();
  const staff = isStaffSteam(user?.steamId);
  const allowed =
    staff ||
    (user?.steamId && ticket.steamId === user.steamId) ||
    (guestId && ticket.guestId === guestId);
  if (!allowed) notFound();
  return <TicketThread ticket={ticket} staff={staff} />;
}
