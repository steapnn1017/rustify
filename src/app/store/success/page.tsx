import Link from "next/link";
import { fulfillOrder } from "@/lib/commerce/fulfill";
import { getPurchase } from "@/lib/commerce/orders";
import { formatEur } from "@/lib/format";
import { getPaymentProvider } from "@/lib/payments";
import { getStripeProvider } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}) {
  const { order, session_id: sessionId } = await searchParams;
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
          verifyError = "Payment is still processing. Refresh this page in a moment.";
        }
      } catch (error) {
        verifyError = error instanceof Error ? error.message : "Could not verify Stripe payment.";
      }
    }
  }

  const paid = purchase?.status === "paid";

  return (
    <section className="section">
      <div className="container prose">
        <p className="kicker">Order</p>
        <h1>{paid ? "Payment received" : "Confirming payment"}</h1>
        {purchase ? (
          <>
            <p>
              {purchase.tier.replace("_", " ")} is bound to SteamID64{" "}
              <span className="mono">{purchase.steamId}</span> on {purchase.serverName} (
              {formatEur(purchase.amountCents)}). Status: <strong>{purchase.status}</strong>
              {paid ? ". Join on this Steam account to receive it in-game." : "."}
            </p>
            <p>
              Invoice{" "}
              <Link href={`/api/invoices/${purchase.invoiceId}`}>{purchase.invoiceId}</Link>
            </p>
          </>
        ) : (
          <p>We could not find this order yet. If you paid in Stripe, open your account in a minute.</p>
        )}
        {verifyError ? (
          <p className="alert alert--error" role="alert">
            {verifyError}
          </p>
        ) : null}
        <div className="actions">
          <Link className="btn btn-primary" href="/account">
            Account
          </Link>
          <Link className="btn" href="/store">
            Store
          </Link>
        </div>
      </div>
    </section>
  );
}
