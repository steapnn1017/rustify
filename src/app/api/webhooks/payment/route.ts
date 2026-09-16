import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/commerce/fulfill";
import { markFailed } from "@/lib/commerce/orders";
import { grantEntitlement } from "@/lib/entitlements/store";
import { getPaymentProvider } from "@/lib/payments";
import { getTier, type StoreTierId } from "@/lib/store/catalog";

export async function POST(request: Request) {
  try {
    const event = await getPaymentProvider().parseWebhook(request);
    if (event.type === "payment.succeeded") {
      await fulfillOrder(event.orderId);
    }
    if (event.type === "payment.failed") {
      markFailed(event.orderId);
    }
    if (event.type === "subscription.renewed" && event.steamId && event.serverId && event.tierId) {
      const tier = getTier(event.tierId);
      if (tier) {
        await grantEntitlement({
          steamId: event.steamId,
          serverId: event.serverId,
          tier: event.tierId as StoreTierId,
          durationDays: tier.durationDays,
          purchaseId: event.orderId,
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook rejected";
    if (message.startsWith("Unhandled Stripe event:")) {
      return NextResponse.json({ received: true, ignored: true });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
