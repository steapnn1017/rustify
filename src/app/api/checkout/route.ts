import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isSteamId64, quoteCoupon } from "@/lib/commerce/coupons";
import { attachPaymentSession, createPurchase } from "@/lib/commerce/orders";
import { fulfillOrder } from "@/lib/commerce/fulfill";
import { getLiveProvider } from "@/lib/live";
import { getPaymentProvider } from "@/lib/payments";
import { site } from "@/lib/site";
import { appliesToLabel, getTier, isRegionTier, regionFromPackId, regionPackId } from "@/lib/store/catalog";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in with Steam first." }, { status: 401 });

  const body = (await request.json()) as {
    serverId?: string;
    tierId?: string;
    agreeTerms?: boolean;
    agreeImmediateDelivery?: boolean;
    couponCode?: string;
    gift?: boolean;
    giftSteamId?: string;
    billing?: "once" | "subscription";
  };

  if (!body.agreeTerms || !body.agreeImmediateDelivery) {
    return NextResponse.json(
      { error: "Terms and immediate-delivery consent are both required." },
      { status: 400 },
    );
  }

  const giftSteamId = body.gift ? body.giftSteamId?.trim() : "";
  if (body.gift) {
    if (!giftSteamId || !isSteamId64(giftSteamId)) {
      return NextResponse.json({ error: "Enter a valid recipient SteamID64." }, { status: 400 });
    }
  }

  const tier = body.tierId ? getTier(body.tierId) : null;
  const servers = await getLiveProvider().getServers();
  const packRegion = regionFromPackId(body.serverId || "");
  const server =
    servers.find((item) => item.id === body.serverId) ??
    (packRegion ? servers.find((item) => item.region === packRegion) : undefined);
  if (!tier || !server) {
    return NextResponse.json({ error: "Unknown server or tier." }, { status: 400 });
  }

  let amountCents = tier.priceCents;
  let discountCents = 0;
  let couponCode: string | undefined;
  const billing = body.billing === "subscription" ? "subscription" : "once";
  if (billing === "once" && body.couponCode?.trim()) {
    const quote = quoteCoupon(body.couponCode, tier.priceCents);
    if ("error" in quote) return NextResponse.json({ error: quote.error }, { status: 400 });
    amountCents = quote.totalCents;
    discountCents = quote.discountCents;
    couponCode = quote.code;
  }

  const recipientId = giftSteamId && giftSteamId !== user.steamId ? giftSteamId : undefined;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const draft = createPurchase({
    steamId: user.steamId,
    serverId: isRegionTier(tier.id) ? regionPackId(server.region) : server.id,
    serverName: appliesToLabel(tier.id, server),
    tier: tier.id,
    amountCents,
    currency: "USD",
    couponCode,
    discountCents: discountCents || undefined,
    giftSteamId: recipientId,
    billing,
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
    if (amountCents <= 0) {
      if (billing === "subscription") {
        return NextResponse.json({ error: "Subscriptions cannot be fully covered by a coupon." }, { status: 400 });
      }
      await fulfillOrder(draft.id);
      return NextResponse.json({
        orderId: draft.id,
        invoiceId: draft.invoiceId,
        provider: "coupon",
        redirectUrl: `${site.url}/store/success?order=${draft.id}`,
      });
    }

    const provider = getPaymentProvider();
    const successBase = `${site.url}/store/success?order=${draft.id}`;
    const cancelQuery = isRegionTier(tier.id)
      ? `region=${server.region}&tier=${tier.id}`
      : `server=${server.slug}&tier=${tier.id}`;
    const session = await provider.createCheckout({
      orderId: draft.id,
      steamId: recipientId || user.steamId,
      serverId: draft.serverId,
      tierId: tier.id,
      amountCents,
      currency: "USD",
      billing,
      giftSteamId: recipientId,
      successUrl:
        provider.id === "stripe"
          ? `${successBase}&session_id={CHECKOUT_SESSION_ID}`
          : successBase,
      cancelUrl: `${site.url}/store/checkout?${cancelQuery}`,
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
