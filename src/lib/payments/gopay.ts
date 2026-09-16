import { PaymentConfigError, type CheckoutInput, type CheckoutSession, type PaymentEvent, type PaymentProvider } from "./types";

/** Czech gateways (GoPay / Comgate) share this adapter surface. */
export class GoPayProvider implements PaymentProvider {
  id = "gopay";

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    if (!process.env.GOPAY_CLIENT_ID || !process.env.GOPAY_CLIENT_SECRET) {
      throw new PaymentConfigError("GOPAY_CLIENT_ID / GOPAY_CLIENT_SECRET are not configured");
    }
    void input;
    throw new PaymentConfigError("GoPay payment create is ready to wire — POST /payments/payment then redirect.");
  }

  async parseWebhook(request: Request): Promise<PaymentEvent> {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId") || "";
    if (!orderId) throw new PaymentConfigError("Missing GoPay order id");
    throw new PaymentConfigError("GoPay status poll is ready to wire — GET /payments/payment/{id}.");
  }
}
