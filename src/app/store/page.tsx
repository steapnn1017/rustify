import { StoreView } from "@/components/store/StoreView";
import { getLiveProvider } from "@/lib/live";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store",
  description: "Queue Skip $5 and VIP $10 per server. Region VIP $25 covers every box in EU or US.",
};

export const dynamic = "force-dynamic";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ server?: string }>;
}) {
  const { server } = await searchParams;
  const servers = await getLiveProvider().getServers();
  return <StoreView servers={servers} initialSlug={server} />;
}
