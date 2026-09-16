import type { CheckoutInput, CheckoutSession, PaymentEvent, PaymentProvider } from "./types";

export class MockPaymentProvider implements PaymentProvider {
  id = "mock";

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    return {
      provider: this.id,
      sessionId: `mock_${input.orderId}`,
      status: "succeeded",
      redirectUrl: input.successUrl,
    };
  }

  async parseWebhook(request: Request): Promise<PaymentEvent> {
    const body = (await request.json()) as Partial<PaymentEvent>;
    if (!body.orderId || !body.sessionId) {
      throw new Error("Invalid mock webhook payload");
    }
    return {
      provider: this.id,
      type: body.type ?? "payment.succeeded",
      orderId: body.orderId,
      sessionId: body.sessionId,
    };
  }
}
