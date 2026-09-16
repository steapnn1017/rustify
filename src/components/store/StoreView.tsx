"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import type { ServerSummary } from "@/lib/live";
import type { ServerRegion } from "@/lib/live/types";
import { formatUsd } from "@/lib/format";
import { clusterRegions, regionFlag, serverHeadline } from "@/lib/live/catalog";
import { getTier } from "@/lib/store/catalog";
import { useT } from "@/lib/i18n/I18nProvider";
import { regionTitleKey } from "@/lib/i18n/labels";

export function StoreView({
  servers,
  initialSlug,
}: {
  servers: ServerSummary[];
  initialSlug?: string;
}) {
  const t = useT();
  const initialRegion =
    servers.find((item) => item.slug === initialSlug)?.region ??
    servers.find((item) => item.region === "eu")?.region ??
    "eu";
  const [region, setRegion] = useState<ServerRegion>(initialRegion);
  const queue = getTier("queue_skip")!;
  const vip = getTier("vip")!;
  const regionVip = getTier("region_vip")!;
  const list = useMemo(() => servers.filter((item) => item.region === region), [servers, region]);
  const regionLabel = t(regionTitleKey(region));
  const regionCode = region === "us" ? "US" : "EU";

  return (
    <section className="shop">
      <div className="container shop__inner">
        <header className="shop__head">
          <div>
            <p className="kicker">{t("storeKicker")}</p>
            <h1>{t("storeTitle")}</h1>
            <p>{t("storeBody")}</p>
          </div>
          <Link className="btn btn-ghost" href="/account">
            <ShoppingBag size={15} strokeWidth={1.75} />
            {t("orders")}
          </Link>
        </header>

        <div className="shop-legend">
          <article className="shop-legend__item">
            <span className="kicker">{t("perServer")}</span>
            <strong>{t("queueSkip")}</strong>
            <b>{formatUsd(queue.priceCents)}</b>
            <span>{t("queueSkipHint")}</span>
          </article>
          <article className="shop-legend__item shop-legend__item--vip">
            <span className="kicker">{t("perServer")}</span>
            <strong>{t("vip")}</strong>
            <b>{formatUsd(vip.priceCents)}</b>
            <span>{t("vipHint")}</span>
          </article>
          <article className="shop-legend__item shop-legend__item--silver">
            <span className="kicker">{t("oneRegion")}</span>
            <strong>{t("regionVip")}</strong>
            <b>{formatUsd(regionVip.priceCents)}</b>
            <span>{t("regionVipHint")}</span>
          </article>
        </div>

        <div className="shop-tabs" role="tablist" aria-label={t("stepRegion")}>
          {clusterRegions.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={item.id === region ? "chip is-active" : "chip"}
              aria-selected={item.id === region}
              onClick={() => setRegion(item.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="flag" src={item.flag} alt="" width={16} height={11} />
              {t(regionTitleKey(item.id))}
            </button>
          ))}
        </div>

        <div className="shop-list">
          {list.map((server) => (
            <article key={server.id} className="shop-row">
              <div className="shop-row__server">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="flag" src={regionFlag(server.region)} alt="" width={18} height={12} />
                <div>
                  <strong>{serverHeadline(server)}</strong>
                  <span>{t("daysBound")}</span>
                </div>
              </div>
              <Link className="shop-offer" href={`/store/checkout?server=${server.slug}&tier=queue_skip`}>
                <b>{formatUsd(queue.priceCents)}</b>
                <em>{t("onlyQueue")}</em>
              </Link>
              <Link className="shop-offer shop-offer--vip" href={`/store/checkout?server=${server.slug}&tier=vip`}>
                <b>{formatUsd(vip.priceCents)}</b>
                <em>{t("queueSkin")}</em>
              </Link>
            </article>
          ))}
        </div>

        <article className="shop-region">
          <div>
            <p className="kicker">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="flag" src={regionFlag(region)} alt="" width={18} height={12} />
              {regionLabel}
            </p>
            <h2>{t("regionVip")}</h2>
            <p>{t("regionVipBody", { region: regionLabel })}</p>
            <ul>
              {list.map((server) => (
                <li key={server.id}>
                  <Check size={14} strokeWidth={2} />
                  {serverHeadline(server)}
                </li>
              ))}
            </ul>
          </div>
          <div className="shop-region__buy">
            <strong>{formatUsd(regionVip.priceCents)}</strong>
            <span>{t("slashDays")}</span>
            <Link className="btn btn-silver" href={`/store/checkout?region=${region}&tier=region_vip`}>
              {t("buyRegion", { region: regionCode })}
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
