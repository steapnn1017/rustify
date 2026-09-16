import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServerPageView } from "@/components/servers/ServerPageView";
import { getSession } from "@/lib/auth/session";
import { getLiveProvider } from "@/lib/live";
import { serverCatalog } from "@/lib/live/catalog";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return serverCatalog.map((server) => ({ slug: server.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const server = await getLiveProvider().getServer(slug);
  if (!server) return { title: "Server" };
  return {
    title: server.name,
    description: `${server.name} on ${site.name}. ${server.players}/${server.maxPlayers} live. 2x gather and loot, vanilla stacks.`,
    openGraph: {
      title: `${server.name} · ${site.name}`,
      description: `Live ${server.players}/${server.maxPlayers}. Connect ${server.connect.host}:${server.connect.port}`,
    },
  };
}

export default async function ServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const server = await getLiveProvider().getServer(slug);
  if (!server) notFound();
  const user = await getSession();
  return <ServerPageView server={server} user={user} />;
}
