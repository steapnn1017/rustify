import { StoreView } from "@/components/store/StoreView";
import { getLiveProvider } from "@/lib/live";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store",
  description: "Queue Skip and VIP per server. Pro is Queue Skip on every Rustify box, plus skin box.",
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
