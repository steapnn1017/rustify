import type { Metadata } from "next";
import { MapVotingView } from "@/components/servers/MapVotingView";
import { getSession } from "@/lib/auth/session";
import { serverCatalog } from "@/lib/live/catalog";
import { getLiveProvider } from "@/lib/live";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Map Voting",
  description: `Vote the next wipe map on ${site.name} Main, Mondays, and Monthly.`,
};

export default async function MapVotingPage() {
  const user = await getSession();
  const provider = getLiveProvider();
  const snapshots = await Promise.all(serverCatalog.map((server) => provider.getServer(server.slug)));
  const servers = snapshots.filter((item): item is NonNullable<typeof item> => Boolean(item));

  return <MapVotingView servers={servers} user={user} />;
}
