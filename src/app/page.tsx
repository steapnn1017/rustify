import { Hero } from "@/components/home/Hero";
import { ServerGrid } from "@/components/home/ServerGrid";
import { getFreshSession } from "@/lib/auth/refresh";
import { getLiveProvider } from "@/lib/live";
import { getWhitelistRequest } from "@/lib/whitelist/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getLiveProvider().getCluster();
  const user = await getFreshSession();
  const whitelist = user ? getWhitelistRequest(user.steamId) : null;
  return (
    <>
      <Hero />
      <ServerGrid servers={snapshot.servers} whitelistStatus={whitelist?.status ?? null} />
    </>
  );
}
