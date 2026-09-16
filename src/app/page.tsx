import { Hero } from "@/components/home/Hero";
import { ServerGrid } from "@/components/home/ServerGrid";
import { getLiveProvider } from "@/lib/live";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getLiveProvider().getCluster();
  return (
    <>
      <Hero />
      <ServerGrid servers={snapshot.servers} />
    </>
  );
}
