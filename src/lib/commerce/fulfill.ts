import { grantEntitlement } from "@/lib/entitlements/store";
import { redeemCoupon } from "./coupons";
import { getPurchase, markPaid } from "./orders";
import { getTier } from "@/lib/store/catalog";

export async function fulfillOrder(orderId: string) {
  const purchase = getPurchase(orderId);
  if (!purchase) throw new Error("Order not found");
  if (purchase.status === "paid") return purchase;
  const paid = markPaid(orderId);
  if (!paid) throw new Error("Order not found");
  const tier = getTier(paid.tier);
  if (!tier) throw new Error("Unknown tier");
  if (paid.couponCode && paid.discountCents) {
    redeemCoupon(paid.couponCode, paid.discountCents);
  }
  await grantEntitlement({
    steamId: paid.giftSteamId || paid.steamId,
    serverId: paid.serverId,
    tier: paid.tier,
    durationDays: tier.durationDays,
    purchaseId: paid.id,
  });
  return paid;
}
