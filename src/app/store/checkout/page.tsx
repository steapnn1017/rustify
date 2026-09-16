import { redirect } from "next/navigation";
import { CheckoutView } from "@/components/store/CheckoutView";
import { getSession } from "@/lib/auth/session";
import { getLiveProvider } from "@/lib/live";
import { paymentProviderLabel } from "@/lib/payments";
import { stripeConfigured } from "@/lib/payments/stripe";
import { appliesToLabel, getTier, isRegionTier, productTitle, regionPackId } from "@/lib/store/catalog";
import type { ServerRegion } from "@/lib/live/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ server?: string; tier?: string; region?: string }>;
}) {
  const { server: serverSlug, tier: tierId, region } = await searchParams;
  const user = await getSession();
  const query = new URLSearchParams();
  if (serverSlug) query.set("server", serverSlug);
  if (region) query.set("region", region);
  if (tierId) query.set("tier", tierId);
  const returnTo = `/store/checkout?${query.toString()}`;
  if (!user) redirect(`/api/auth/steam?returnTo=${encodeURIComponent(returnTo)}`);

  const servers = await getLiveProvider().getServers();
  const tier = tierId ? getTier(tierId) : null;
  const selectedRegion = region === "us" || region === "eu" ? (region as ServerRegion) : "eu";
  const server = isRegionTier(tier?.id || "")
    ? servers.find((item) => item.region === selectedRegion)
    : servers.find((item) => item.slug === serverSlug);

  if (!server || !tier) redirect("/store");

  const stripeReady = process.env.PAYMENT_PROVIDER === "mock" || stripeConfigured();

  return (
    <CheckoutView
      user={user}
      title={productTitle(tier, server)}
      appliesTo={appliesToLabel(tier.id, server)}
      priceCents={tier.priceCents}
      durationDays={tier.durationDays}
      serverId={isRegionTier(tier.id) ? regionPackId(server.region) : server.id}
      tier={tier}
      payLabel={paymentProviderLabel()}
      stripeReady={stripeReady}
    />
  );
}
