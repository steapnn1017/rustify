import type { Metadata } from "next";
import { ServerGrid } from "@/components/home/ServerGrid";
import { getFreshSession } from "@/lib/auth/refresh";
import { getLiveProvider } from "@/lib/live";
import { getWhitelistRequest } from "@/lib/whitelist/store";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Servers",
  description: `Live EU and US servers for ${site.name}: Main, Mondays, Monthly, and Solo / Duo / Trio.`,
};

export default async function ServersPage() {
  const snapshot = await getLiveProvider().getCluster();
  const user = await getFreshSession();
  const whitelist = user ? getWhitelistRequest(user.steamId) : null;
  return <ServerGrid servers={snapshot.servers} whitelistStatus={whitelist?.status ?? null} />;
}
