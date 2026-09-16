import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { attachPaymentSession, createPurchase } from "@/lib/commerce/orders";
import { fulfillOrder } from "@/lib/commerce/fulfill";
import { getLiveProvider } from "@/lib/live";
import { getPaymentProvider } from "@/lib/payments";
import { site } from "@/lib/site";
import { appliesToLabel, CLUSTER_SERVER_ID, getTier, isClusterTier } from "@/lib/store/catalog";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in with Steam first." }, { status: 401 });

  const body = (await request.json()) as {
    serverId?: string;
    tierId?: string;
    agreeTerms?: boolean;
    agreeImmediateDelivery?: boolean;
  };

  if (!body.agreeTerms || !body.agreeImmediateDelivery) {
    return NextResponse.json(
      { error: "Terms and immediate-delivery consent are both required." },
      { status: 400 },
    );
  }

  const tier = body.tierId ? getTier(body.tierId) : null;
  const servers = await getLiveProvider().getServers();
  const server = servers.find((item) => item.id === body.serverId);
  if (!tier || !server) {
    return NextResponse.json({ error: "Unknown server or tier." }, { status: 400 });
  }

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const draft = createPurchase({
    steamId: user.steamId,
    serverId: isClusterTier(tier.id) ? CLUSTER_SERVER_ID : server.id,
    serverName: appliesToLabel(tier.id, server.name),
    tier: tier.id,
    amountCents: tier.priceCents,
    currency: "EUR",
    consent: {
      at: new Date().toISOString(),
      steamId: user.steamId,
      orderId: "pending",
      agreeTerms: true,
      agreeImmediateDelivery: true,
      ip: forwarded,
    },
  });

  try {
    const provider = getPaymentProvider();
    const successBase = `${site.url}/store/success?order=${draft.id}`;
    const session = await provider.createCheckout({
      orderId: draft.id,
      steamId: user.steamId,
      serverId: server.id,
      tierId: tier.id,
      amountCents: tier.priceCents,
      currency: "EUR",
      successUrl:
        provider.id === "stripe"
          ? `${successBase}&session_id={CHECKOUT_SESSION_ID}`
          : successBase,
      cancelUrl: `${site.url}/store/checkout?server=${server.slug}&tier=${tier.id}`,
    });

    attachPaymentSession(draft.id, session.provider, session.sessionId);

    if (session.status === "succeeded") {
      await fulfillOrder(draft.id);
    }

    return NextResponse.json({
      orderId: draft.id,
      invoiceId: draft.invoiceId,
      provider: session.provider,
      sessionId: session.sessionId,
      redirectUrl: session.redirectUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
