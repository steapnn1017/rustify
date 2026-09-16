import { GoPayProvider } from "./gopay";
import { MockPaymentProvider } from "./mock";
import { StripeProvider } from "./stripe";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  const configured = (process.env.PAYMENT_PROVIDER || "stripe").toLowerCase();

  if (configured === "mock") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Mock payments are disabled in production. Set PAYMENT_PROVIDER=stripe.");
    }
    return new MockPaymentProvider();
  }

  if (configured === "gopay" || configured === "comgate") {
    return new GoPayProvider();
  }

  return new StripeProvider();
}

export function paymentProviderLabel() {
  try {
    const id = getPaymentProvider().id;
    if (id === "stripe") return "Pay with Stripe";
    if (id === "mock") return "Pay (dev mock)";
    return "Pay";
  } catch {
    return "Pay with Stripe";
  }
}

export type { CheckoutInput, CheckoutSession, PaymentProvider } from "./types";
