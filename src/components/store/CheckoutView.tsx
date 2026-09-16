"use client";

import Link from "next/link";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import type { ServerSummary } from "@/lib/live";
import { appliesToLabel, type StoreTier } from "@/lib/store/catalog";
import { formatEur } from "@/lib/format";

export function CheckoutView({
  user,
  server,
  tier,
  payLabel = "Pay with Stripe",
  stripeReady = true,
}: {
  user: SessionUser;
  server: ServerSummary;
  tier: StoreTier;
  payLabel?: string;
  stripeReady?: boolean;
}) {
  const [terms, setTerms] = useState(false);
  const [immediate, setImmediate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!stripeReady) {
      setError("Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local and restart the server.");
      return;
    }
    if (!terms || !immediate) {
      setError("Both consent checkboxes are required before payment.");
      return;
    }
    setPending(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serverId: server.id,
        tierId: tier.id,
        agreeTerms: terms,
        agreeImmediateDelivery: immediate,
      }),
    });
    const payload = (await response.json()) as { error?: string; redirectUrl?: string };
    if (!response.ok) {
      setPending(false);
      setError(payload.error || "Checkout failed");
      return;
    }
    if (payload.redirectUrl) {
      window.location.href = payload.redirectUrl;
      return;
    }
    setPending(false);
    setError("Stripe did not return a checkout URL.");
  }

  return (
    <section className="checkout-page">
      <div className="container checkout-layout">
        <header className="page-intro">
          <div>
            <p className="kicker">Checkout</p>
            <h1>
              {tier.name} · {appliesToLabel(tier.id, server.name)}
            </h1>
          </div>
        </header>

        <div className="checkout-summary">
          <p className="stat-label">Granted in-game to</p>
          <p className="mono">
            {user.name} · SteamID64 {user.steamId}
          </p>
          <p>
            {formatEur(tier.priceCents)} · {tier.durationDays} days on{" "}
            {appliesToLabel(tier.id, server.name)}. You will pay securely on Stripe — VIP is only granted
            after payment succeeds.
          </p>
        </div>

        {!stripeReady ? (
          <p className="alert alert--error" role="alert">
            Stripe secret key missing. Add <span className="mono">STRIPE_SECRET_KEY</span> to{" "}
            <span className="mono">.env.local</span> and restart.
          </p>
        ) : null}

        <form className="form" onSubmit={submit}>
          <label className="check">
            <input
              type="checkbox"
              checked={terms}
              onChange={(event) => setTerms(event.target.checked)}
            />
            <span>
              I have read and agree to the{" "}
              <Link href="/legal/terms">Terms & Conditions (VOP)</Link>.
            </span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={immediate}
              onChange={(event) => setImmediate(event.target.checked)}
            />
            <span>
              I request immediate performance of this digital content and acknowledge that I lose
              the statutory right of withdrawal under Czech Civil Code § 1837 / Directive 2011/83/EU.
            </span>
          </label>
          {error ? (
            <p className="alert alert--error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="btn btn-primary" type="submit" disabled={pending || !stripeReady}>
            {pending ? "Redirecting to Stripe…" : `${payLabel} ${formatEur(tier.priceCents)}`}
          </button>
        </form>
      </div>
    </section>
  );
}
