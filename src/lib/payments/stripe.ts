import Stripe from "stripe";
import { getTier } from "@/lib/store/catalog";
import {
  PaymentConfigError,
  type CheckoutInput,
  type CheckoutSession,
  type PaymentEvent,
  type PaymentProvider,
} from "./types";

function client() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new PaymentConfigError(
      "STRIPE_SECRET_KEY is missing. Add your Stripe secret key to .env.local (sk_live_… or sk_test_…).",
    );
  }
  return new Stripe(key);
}

export class StripeProvider implements PaymentProvider {
  id = "stripe";

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    const stripe = client();
    const tier = getTier(input.tierId);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: input.successUrl.includes("{CHECKOUT_SESSION_ID}")
        ? input.successUrl
        : `${input.successUrl}${input.successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: input.cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: input.amountCents,
            product_data: {
              name: `RUSTIFY.GG · ${tier?.name ?? input.tierId}`,
              description: `SteamID64 ${input.steamId} · ${input.serverId} · ${tier?.durationDays ?? 30} days`,
            },
          },
        },
      ],
      metadata: {
        orderId: input.orderId,
        steamId: input.steamId,
        serverId: input.serverId,
        tierId: input.tierId,
      },
      client_reference_id: input.orderId,
      // Only fulfill after Stripe confirms payment (webhook and/or success-page verify).
    });

    if (!session.url) {
      throw new PaymentConfigError("Stripe did not return a Checkout URL");
    }

    return {
      provider: this.id,
      sessionId: session.id,
      status: "pending",
      redirectUrl: session.url,
    };
  }

  async parseWebhook(request: Request): Promise<PaymentEvent> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) throw new PaymentConfigError("STRIPE_WEBHOOK_SECRET is not configured");
    const signature = request.headers.get("stripe-signature");
    if (!signature) throw new PaymentConfigError("Missing stripe-signature");

    const stripe = client();
    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid" && session.status !== "complete") {
        throw new PaymentConfigError("Stripe session completed but not paid");
      }
      const orderId = session.metadata?.orderId || session.client_reference_id;
      if (!orderId) throw new PaymentConfigError("Stripe session missing orderId");
      return {
        provider: this.id,
        type: "payment.succeeded",
        orderId,
        sessionId: session.id,
      };
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId || session.client_reference_id;
      if (!orderId) throw new PaymentConfigError("Stripe failure event missing orderId");
      return {
        provider: this.id,
        type: "payment.failed",
        orderId,
        sessionId: session.id,
      };
    }

    throw new PaymentConfigError(`Unhandled Stripe event: ${event.type}`);
  }

  async verifyCheckoutSession(sessionId: string): Promise<{ paid: boolean; orderId: string | null }> {
    const stripe = client();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId || session.client_reference_id || null;
    const paid = session.payment_status === "paid";
    return { paid, orderId };
  }
}

export function getStripeProvider() {
  return new StripeProvider();
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
