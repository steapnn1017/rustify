import { redirect } from "next/navigation";
import { AccountView } from "@/components/account/AccountView";
import { getFreshSession } from "@/lib/auth/refresh";
import { listPurchases } from "@/lib/commerce/orders";
import { discordConfigured } from "@/lib/discord/oauth";
import { activeEntitlements } from "@/lib/entitlements/store";
import { getPlayerStats } from "@/lib/stats";
import { getUserProfile } from "@/lib/users/store";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ discord?: string }>;
}) {
  const user = await getFreshSession();
  if (!user) redirect("/api/auth/steam?returnTo=/account");
  const { discord } = await searchParams;
  const profile = getUserProfile(user.steamId);
  const stats = await getPlayerStats(user.steamId, profile.statsServerId);
  return (
    <AccountView
      user={user}
      profile={profile}
      purchases={listPurchases(user.steamId)}
      entitlements={activeEntitlements(user.steamId)}
      stats={stats}
      discordReady={discordConfigured()}
      discordStatus={discord}
    />
  );
}
