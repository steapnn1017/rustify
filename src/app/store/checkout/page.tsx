import { redirect } from "next/navigation";
import { CheckoutView } from "@/components/store/CheckoutView";
import { getSession } from "@/lib/auth/session";
import { getLiveProvider } from "@/lib/live";
import { paymentProviderLabel } from "@/lib/payments";
import { stripeConfigured } from "@/lib/payments/stripe";
import { getTier } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ server?: string; tier?: string }>;
}) {
  const { server: serverSlug, tier: tierId } = await searchParams;
  const user = await getSession();
  const returnTo = `/store/checkout?server=${serverSlug ?? ""}&tier=${tierId ?? ""}`;
  if (!user) redirect(`/api/auth/steam?returnTo=${encodeURIComponent(returnTo)}`);
  const servers = await getLiveProvider().getServers();
  const server = servers.find((item) => item.slug === serverSlug);
  const tier = tierId ? getTier(tierId) : null;
  if (!server || !tier) redirect("/store");

  const stripeReady =
    process.env.PAYMENT_PROVIDER === "mock" || stripeConfigured();

  return (
    <CheckoutView
      user={user}
      server={server}
      tier={tier}
      payLabel={paymentProviderLabel()}
      stripeReady={stripeReady}
    />
  );
}
