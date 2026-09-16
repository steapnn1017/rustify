import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { quoteCoupon } from "@/lib/commerce/coupons";
import { getTier } from "@/lib/store/catalog";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in with Steam first." }, { status: 401 });

  const body = (await request.json()) as { code?: string; tierId?: string };
  const tier = body.tierId ? getTier(body.tierId) : null;
  if (!tier) return NextResponse.json({ error: "Unknown product." }, { status: 400 });

  const quote = quoteCoupon(body.code || "", tier.priceCents);
  if ("error" in quote) return NextResponse.json({ error: quote.error }, { status: 400 });
  return NextResponse.json(quote);
}
