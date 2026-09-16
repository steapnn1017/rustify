"use client";

import Link from "next/link";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import type { ServerSummary } from "@/lib/live";
import { formatEur } from "@/lib/format";
import { getTier } from "@/lib/store/catalog";

export function StoreView({
  servers,
  initialSlug,
}: {
  servers: ServerSummary[];
  initialSlug?: string;
}) {
  const first = servers[0]?.slug ?? "main";
  const [slug, setSlug] = useState(
    initialSlug && servers.some((s) => s.slug === initialSlug) ? initialSlug : first,
  );
  const server = useMemo(() => servers.find((item) => item.slug === slug) ?? servers[0], [servers, slug]);
  const vip = getTier("vip")!;
  const queue = getTier("queue_skip")!;
  const pro = getTier("pro")!;
  if (!server) return null;

  const save = vip.priceCents * servers.length - pro.priceCents;

  return (
    <section className="shop">
      <div className="shop__bg" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/store-bg.svg" alt="" />
        <div className="shop__veil" />
      </div>

      <div className="container shop__inner">
        <header className="shop__head">
          <div className="shop__brand">
            <span className="brand__mark brand__mark--md" aria-hidden="true">
              R
            </span>
            <div>
              <h1>Rustify</h1>
              <p>No waiting around — all purchases are automatically delivered!</p>
            </div>
          </div>
          <Link className="btn btn-ghost" href="/account">
            <ShoppingBag size={15} strokeWidth={1.75} />
            My purchases
          </Link>
        </header>

        <h2 className="shop__question">Where do you play?</h2>
        <div className="pick-grid">
          {servers.map((item) => {
            const on = item.slug === slug;
            return (
              <button
                key={item.id}
                type="button"
                className={on ? "pick is-on" : "pick"}
                onClick={() => setSlug(item.slug)}
                aria-pressed={on}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="flag" src="/flags/eu.svg" alt="" width={22} height={15} />
                <span>
                  <small>Europe</small>
                  <strong>[EU] Rustify {item.name}</strong>
                </span>
                <i className="pick__radio" aria-hidden="true">
                  {on ? <Check size={12} strokeWidth={3} /> : null}
                </i>
              </button>
            );
          })}
        </div>

        <article className="feature">
          <div className="feature__art" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vip-art.svg" alt="" />
          </div>
          <div className="feature__body">
            <p className="eyebrow">Europe · {server.name}</p>
            <h2>[EU] Rustify {server.name} — VIP</h2>
            <p>{vip.summary}</p>
            <div className="feature__price">
              <strong>{formatEur(vip.priceCents)}</strong>
              <span>/ {vip.durationDays} days</span>
            </div>
            <div className="feature__actions">
              <Link className="btn btn-primary" href={`/store/checkout?server=${server.slug}&tier=vip`}>
                Buy now
                <ArrowRight size={16} />
              </Link>
              <Link className="btn btn-ghost" href={`/store/checkout?server=${server.slug}&tier=queue_skip`}>
                Queue Skip · {formatEur(queue.priceCents)}
              </Link>
            </div>
          </div>
        </article>

        <article className="upsell">
          <div className="upsell__main">
            <span className="brand__mark" aria-hidden="true">
              R
            </span>
            <div>
              <span className="pill">All servers</span>
              <h2>[ALL] Rustify Servers — Pro</h2>
              <p>Play on more than one server?</p>
            </div>
          </div>
          <div className="upsell__buy">
            <strong>{formatEur(pro.priceCents)}</strong>
            <span>/ {pro.durationDays} days</span>
            {save > 0 ? <em>Save {formatEur(save)} vs VIP on every box</em> : null}
            <Link className="btn btn-ghost" href={`/store/checkout?server=${server.slug}&tier=pro`}>
              Details
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
