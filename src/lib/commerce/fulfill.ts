import { grantEntitlement } from "@/lib/entitlements/store";
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
  await grantEntitlement({
    steamId: paid.steamId,
    serverId: paid.serverId,
    tier: paid.tier,
    durationDays: tier.durationDays,
    purchaseId: paid.id,
  });
  return paid;
}
