import { randomUUID } from "crypto";
import { loadJson, saveJson } from "@/lib/persist";
import type { StoreTierId } from "@/lib/store/catalog";

export type ConsentLog = {
  at: string;
  steamId: string;
  orderId: string;
  agreeTerms: boolean;
  agreeImmediateDelivery: boolean;
  ip: string;
};

export type Purchase = {
  id: string;
  invoiceId: string;
  steamId: string;
  serverId: string;
  serverName: string;
  tier: StoreTierId;
  amountCents: number;
  currency: "USD" | "EUR";
  status: "pending" | "paid" | "failed";
  createdAt: string;
  paidAt?: string;
  consent: ConsentLog;
  paymentProvider?: string;
  paymentSessionId?: string;
  couponCode?: string;
  discountCents?: number;
  giftSteamId?: string;
  billing?: "once" | "subscription";
};

const FILE = "purchases.json";

function read(): Purchase[] {
  return loadJson<Purchase[]>(FILE, []);
}

function write(purchases: Purchase[]) {
  saveJson(FILE, purchases);
}

export function createPurchase(
  input: Omit<Purchase, "id" | "invoiceId" | "createdAt" | "status"> & { status?: Purchase["status"] },
) {
  const purchases = read();
  const createdAt = new Date().toISOString();
  const id = randomUUID();
  const purchase: Purchase = {
    ...input,
    id,
    invoiceId: `RF-${createdAt.slice(0, 10).replace(/-/g, "")}-${id.slice(0, 6).toUpperCase()}`,
    createdAt,
    status: input.status ?? "pending",
  };
  purchase.consent = { ...purchase.consent, orderId: id };
  purchases.unshift(purchase);
  write(purchases);
  return purchase;
}

export function markPaid(orderId: string) {
  const purchases = read();
  const purchase = purchases.find((item) => item.id === orderId);
  if (!purchase) return null;
  purchase.status = "paid";
  purchase.paidAt = new Date().toISOString();
  write(purchases);
  return purchase;
}

export function markFailed(orderId: string) {
  const purchases = read();
  const purchase = purchases.find((item) => item.id === orderId);
  if (!purchase) return null;
  purchase.status = "failed";
  write(purchases);
  return purchase;
}

export function attachPaymentSession(orderId: string, provider: string, sessionId: string) {
  const purchases = read();
  const purchase = purchases.find((item) => item.id === orderId);
  if (!purchase) return null;
  purchase.paymentProvider = provider;
  purchase.paymentSessionId = sessionId;
  write(purchases);
  return purchase;
}

export function getPurchase(orderId: string) {
  return read().find((item) => item.id === orderId) ?? null;
}

export function getPurchaseByInvoice(invoiceId: string) {
  return read().find((item) => item.invoiceId === invoiceId) ?? null;
}

export function listPurchases(steamId: string) {
  return read().filter((item) => item.steamId === steamId);
}
