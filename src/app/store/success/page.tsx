import type { Metadata } from "next";
import { fulfillOrder } from "@/lib/commerce/fulfill";
import { getPurchase } from "@/lib/commerce/orders";
import { getPaymentProvider } from "@/lib/payments";
import { getStripeProvider } from "@/lib/payments/stripe";
import { getTier } from "@/lib/store/catalog";
import { SuccessReceipt } from "@/components/store/SuccessReceipt";

export const metadata: Metadata = {
  title: "Payment",
};

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}) {
  const { order, sessionId } = await parseParams(searchParams);
  let purchase = order ? getPurchase(order) : null;
  let verifyError: string | null = null;

  if (purchase?.status !== "paid") {
    const provider = getPaymentProvider();
    if (provider.id === "stripe" && sessionId && !sessionId.includes("{CHECKOUT_SESSION_ID}")) {
      try {
        const verified = await getStripeProvider().verifyCheckoutSession(sessionId);
        const orderId = verified.orderId || order;
        if (verified.paid && orderId) {
          purchase = await fulfillOrder(orderId);
        } else if (!verified.paid) {
          verifyError = "Stripe has not marked this session as paid yet. Refresh in a few seconds.";
        }
      } catch (error) {
        verifyError = error instanceof Error ? error.message : "Could not verify Stripe payment.";
      }
    }
  }

  const paid = purchase?.status === "paid";
  const tier = purchase ? getTier(purchase.tier) : null;

  return (
    <SuccessReceipt
      paid={paid}
      purchase={purchase}
      productName={tier?.name ?? null}
      durationDays={tier?.durationDays ?? 30}
      verifyError={verifyError}
    />
  );
}

async function parseParams(searchParams: Promise<{ order?: string; session_id?: string }>) {
  const params = await searchParams;
  return { order: params.order, sessionId: params.session_id };
}
