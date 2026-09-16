import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/commerce/fulfill";
import { markFailed } from "@/lib/commerce/orders";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(request: Request) {
  try {
    const event = await getPaymentProvider().parseWebhook(request);
    if (event.type === "payment.succeeded") {
      await fulfillOrder(event.orderId);
    }
    if (event.type === "payment.failed") {
      markFailed(event.orderId);
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
