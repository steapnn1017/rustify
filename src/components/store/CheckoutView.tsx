"use client";

import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { formatUsd } from "@/lib/format";
import type { StoreTier } from "@/lib/store/catalog";
import { useT } from "@/lib/i18n/I18nProvider";

type Billing = "once" | "subscription";

export function CheckoutView({
  user,
  title,
  appliesTo,
  priceCents,
  durationDays,
  serverId,
  tier,
  payLabel = "Pay with Stripe",
  stripeReady = true,
}: {
  user: SessionUser;
  title: string;
  appliesTo: string;
  priceCents: number;
  durationDays: number;
  serverId: string;
  tier: StoreTier;
  payLabel?: string;
  stripeReady?: boolean;
}) {
  const t = useT();
  const [terms, setTerms] = useState(false);
  const [immediate, setImmediate] = useState(false);
  const [gift, setGift] = useState(false);
  const [giftSteamId, setGiftSteamId] = useState("");
  const [giftProfile, setGiftProfile] = useState<SessionUser | null>(null);
  const [giftStatus, setGiftStatus] = useState<"idle" | "loading" | "error">("idle");
  const [billing, setBilling] = useState<Billing>("once");
  const [codeInput, setCodeInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountCents: number; totalCents: number; label: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [couponPending, setCouponPending] = useState(false);

  const dueCents = billing === "subscription" ? priceCents : (coupon?.totalCents ?? priceCents);
  const canPay = terms && immediate && !pending && (dueCents <= 0 || stripeReady) && (!gift || Boolean(giftProfile));

  useEffect(() => {
    const steamId = giftSteamId.trim();
    if (!gift) {
      setGiftProfile(null);
      setGiftStatus("idle");
      return;
    }
    if (!/^7656119\d{10}$/.test(steamId)) {
      setGiftProfile(null);
      setGiftStatus(steamId ? "error" : "idle");
      return;
    }

    const controller = new AbortController();
    setGiftStatus("loading");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/steam/profile?id=${encodeURIComponent(steamId)}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as SessionUser & { error?: string };
        if (!response.ok) {
          setGiftProfile(null);
          setGiftStatus("error");
          return;
        }
        setGiftProfile({ steamId: payload.steamId, name: payload.name, avatar: payload.avatar });
        setGiftStatus("idle");
      } catch (lookupError) {
        if ((lookupError as { name?: string }).name === "AbortError") return;
        setGiftProfile(null);
        setGiftStatus("error");
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [gift, giftSteamId]);

  async function applyCode() {
    setCouponError(null);
    setError(null);
    setCouponPending(true);
    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeInput, tierId: tier.id }),
    });
    const payload = (await response.json()) as {
      error?: string;
      code?: string;
      discountCents?: number;
      totalCents?: number;
      label?: string;
    };
    setCouponPending(false);
    if (!response.ok || payload.discountCents == null || payload.totalCents == null || !payload.code) {
      setCoupon(null);
      setCouponError(payload.error || t("invalidCode"));
      return;
    }
    setCoupon({
      code: payload.code,
      discountCents: payload.discountCents,
      totalCents: payload.totalCents,
      label: payload.label || t("discount"),
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (dueCents > 0 && !stripeReady) {
      setError(t("paymentsMissing"));
      return;
    }
    if (!terms || !immediate) {
      setError(t("confirmChecks"));
      return;
    }
    if (gift && !giftProfile) {
      setError(t("validRecipient"));
      return;
    }
    setPending(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId,
        tierId: tier.id,
        agreeTerms: terms,
        agreeImmediateDelivery: immediate,
        couponCode: billing === "once" ? coupon?.code : undefined,
        gift,
        giftSteamId: giftSteamId.trim(),
        billing,
      }),
    });
    const payload = (await response.json()) as { error?: string; redirectUrl?: string };
    if (!response.ok) {
      setPending(false);
      setError(payload.error || t("checkoutFailed"));
      return;
    }
    if (payload.redirectUrl) {
      window.location.href = payload.redirectUrl;
      return;
    }
    setPending(false);
    setError(t("noStripeUrl"));
  }

  const recipient = gift && giftProfile ? giftProfile : user;

  return (
    <section className="checkout-page">
      <div className="container checkout-grid">
        <header className="page-intro checkout-grid__full checkout-head">
          <div>
            <Link className="back-link" href="/store">
              <ArrowLeft size={14} strokeWidth={1.75} />
              {t("backStore")}
            </Link>
            <p className="kicker">{t("checkoutSecure")}</p>
            <h1>{title}</h1>
          </div>
        </header>

        <aside className="checkout-card">
          <p className="kicker">{t("checkoutOrder")}</p>
          <h2>{title}</h2>
          <p className="checkout-card__applies">{appliesTo}</p>

          <div className="checkout-seg" role="group" aria-label="Billing">
            <button type="button" className={billing === "once" ? "is-on" : undefined} onClick={() => setBilling("once")}>
              {t("oneTime")}
            </button>
            <button
              type="button"
              className={billing === "subscription" ? "is-on" : undefined}
              onClick={() => setBilling("subscription")}
            >
              {t("subscription")}
            </button>
          </div>

          <div className="checkout-lines">
            <div>
              <span>
                {tier.name}
                {billing === "subscription" ? ` · ${t("perMonth")}` : ` · ${t("days", { n: durationDays })}`}
              </span>
              <strong>
                {formatUsd(priceCents)}
                {billing === "subscription" ? t("perMo") : ""}
              </strong>
            </div>
            {billing === "once" && coupon ? (
              <div className="is-discount">
                <span>
                  {coupon.code} · {coupon.label}
                </span>
                <strong>−{formatUsd(coupon.discountCents)}</strong>
              </div>
            ) : null}
            <div className="is-total">
              <span>{billing === "subscription" ? t("dueToday") : t("totalToday")}</span>
              <strong>
                {formatUsd(dueCents)}
                {billing === "subscription" ? t("perMo") : ""}
              </strong>
            </div>
          </div>

          <div className="checkout-seg" role="group" aria-label="Recipient">
            <button type="button" className={!gift ? "is-on" : undefined} onClick={() => setGift(false)}>
              {t("forMe")}
            </button>
            <button type="button" className={gift ? "is-on" : undefined} onClick={() => setGift(true)}>
              {t("gift")}
            </button>
          </div>

          {gift ? (
            <label className="field">
              {t("recipient")}
              <input
                value={giftSteamId}
                onChange={(event) => setGiftSteamId(event.target.value.replace(/\s/g, ""))}
                inputMode="numeric"
                placeholder="76561198000000000"
                autoComplete="off"
              />
            </label>
          ) : null}
          {gift && giftStatus === "loading" ? <p className="checkout-note">{t("lookingUp")}</p> : null}
          {gift && giftStatus === "error" && giftSteamId.trim() ? (
            <p className="checkout-note is-error">{t("noProfile")}</p>
          ) : null}

          <div className="checkout-steam">
            <span className="kicker">{gift ? t("deliveredTo") : t("yourAccount")}</span>
            <div className="checkout-steam__who">
              {recipient.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipient.avatar} alt="" width={40} height={40} />
              ) : (
                <span className="checkout-steam__fallback" aria-hidden="true" />
              )}
              <strong>
                {recipient.name} ({recipient.steamId})
              </strong>
            </div>
            {gift ? (
              <p className="checkout-steam__gift">
                {t("paidBy", { name: user.name, id: user.steamId })}
              </p>
            ) : null}
          </div>
        </aside>

        <form className="checkout-pay" onSubmit={submit}>
          <p className="kicker">{t("checkoutPayment")}</p>
          <h2>{t("checkoutConfirm")}</h2>
          <p>
            {billing === "subscription"
              ? t("billedMonthly")
              : dueCents <= 0
                ? t("covers")
                : t("finishStripe")}
          </p>

          {billing === "once" ? (
            <div className="checkout-code">
              <label className="field">
                {t("coupon")}
                <input
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value)}
                  placeholder={t("enterCode")}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <button className="btn btn-ghost" type="button" onClick={applyCode} disabled={couponPending || !codeInput.trim()}>
                {couponPending ? t("checking") : t("apply")}
              </button>
            </div>
          ) : null}
          {billing === "once" && couponError ? <p className="checkout-note is-error">{couponError}</p> : null}
          {billing === "once" && coupon ? <p className="checkout-note">{t("applied", { code: coupon.code })}</p> : null}

          {!stripeReady && dueCents > 0 ? (
            <p className="alert alert--error" role="alert">
              {t("stripeMissing")}
            </p>
          ) : null}

          <label className="checkout-agree">
            <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} />
            <span>
              {t("agreePrefix")} <Link href="/legal/terms">{t("legalTerms")}</Link>.
            </span>
          </label>
          <label className="checkout-agree">
            <input
              type="checkbox"
              checked={immediate}
              onChange={(event) => setImmediate(event.target.checked)}
            />
            <span>{t("deliverNow")}</span>
          </label>

          {error ? (
            <p className="alert alert--error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={!canPay}>
            {pending
              ? t("wait")
              : dueCents <= 0
                ? `${t("claimRank")} · ${formatUsd(0)}`
                : `${t("payStripe")} · ${formatUsd(dueCents)}${billing === "subscription" ? t("perMo") : ""}`}
          </button>

          <p className="checkout-trust">
            <Lock size={14} strokeWidth={1.75} />
            {t("encrypted")}
            <ShieldCheck size={14} strokeWidth={1.75} />
            {t("boundSteam")}
          </p>
        </form>
      </div>
    </section>
  );
}
