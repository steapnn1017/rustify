import { loadJson, saveJson } from "@/lib/persist";

export type CouponKind = "percent" | "fixed" | "giftcard";

export type Coupon = {
  code: string;
  kind: CouponKind;
  value: number;
  remainingCents?: number;
  maxRedemptions?: number;
  redemptions: number;
  active?: boolean;
};

export type CouponQuote = {
  code: string;
  discountCents: number;
  totalCents: number;
  label: string;
};

const FILE = "coupons.json";

function read(): Coupon[] {
  return loadJson<Coupon[]>(FILE, []);
}

function write(coupons: Coupon[]) {
  saveJson(FILE, coupons);
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function quoteCoupon(rawCode: string, subtotalCents: number): CouponQuote | { error: string } {
  const code = normalizeCouponCode(rawCode);
  if (!code) return { error: "Enter a coupon or gift card code." };
  const coupon = read().find((item) => item.code.toUpperCase() === code);
  if (!coupon || coupon.active === false) return { error: "This code is not valid." };
  if (coupon.maxRedemptions && coupon.redemptions >= coupon.maxRedemptions) {
    return { error: "This code has already been used." };
  }

  let discount = 0;
  if (coupon.kind === "percent") discount = Math.round((subtotalCents * coupon.value) / 100);
  if (coupon.kind === "fixed") discount = coupon.value;
  if (coupon.kind === "giftcard") discount = coupon.remainingCents ?? coupon.value;
  discount = Math.min(Math.max(0, discount), subtotalCents);
  if (discount <= 0) return { error: "This code has no remaining balance." };

  return {
    code: coupon.code,
    discountCents: discount,
    totalCents: subtotalCents - discount,
    label: coupon.kind === "percent" ? `${coupon.value}% off` : "Gift card",
  };
}

export function redeemCoupon(rawCode: string, discountCents: number) {
  const code = normalizeCouponCode(rawCode);
  const coupons = read();
  const coupon = coupons.find((item) => item.code.toUpperCase() === code);
  if (!coupon) return;
  coupon.redemptions += 1;
  if (coupon.kind === "giftcard") {
    const remaining = coupon.remainingCents ?? coupon.value;
    coupon.remainingCents = Math.max(0, remaining - discountCents);
  }
  write(coupons);
}

export function isSteamId64(value: string) {
  return /^7656119\d{10}$/.test(value.trim());
}
