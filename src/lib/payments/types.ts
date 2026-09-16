export type PaymentStatus = "pending" | "succeeded" | "failed";

export type CheckoutInput = {
  orderId: string;
  steamId: string;
  serverId: string;
  tierId: string;
  amountCents: number;
  currency: "EUR";
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSession = {
  provider: string;
  sessionId: string;
  status: PaymentStatus;
  redirectUrl?: string;
};

export type PaymentEvent = {
  provider: string;
  type: "payment.succeeded" | "payment.failed";
  orderId: string;
  sessionId: string;
};

export interface PaymentProvider {
  id: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  parseWebhook(request: Request): Promise<PaymentEvent>;
}

export class PaymentConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentConfigError";
  }
}
