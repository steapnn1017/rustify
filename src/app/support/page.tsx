import type { Metadata } from "next";
import { SupportHub } from "@/components/support/SupportHub";
import { discordConfigured } from "@/lib/discord/oauth";
import { getGuestId } from "@/lib/auth/guest";
import { getFreshSession } from "@/lib/auth/refresh";
import { isStaffSteam } from "@/lib/staff/access";
import { listTickets } from "@/lib/support/store";
import { getUserProfile } from "@/lib/users/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ discord?: string }>;
}) {
  const { discord } = await searchParams;
  const user = await getFreshSession();
  const guestId = await getGuestId();
  const profile = user ? getUserProfile(user.steamId) : null;
  const tickets = isStaffSteam(user?.steamId)
    ? listTickets({ all: true })
    : listTickets({ steamId: user?.steamId, guestId });
  return <SupportHub user={user} profile={profile} tickets={tickets} discordStatus={discord} discordReady={discordConfigured()} />;
}
