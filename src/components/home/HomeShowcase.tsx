"use client";

import Link from "next/link";
import { clusterKinds, clusterRegions, findClusterServer, serverHeadline } from "@/lib/live/catalog";
import { useT } from "@/lib/i18n/I18nProvider";
import { kindBlurbKey, kindTitleKey, regionTitleKey } from "@/lib/i18n/labels";

export function HomeShowcase() {
  const t = useT();
  return (
    <section className="showcase">
      <div className="container showcase__inner">
        <header className="page-intro">
          <p className="kicker">{t("cluster")}</p>
          <h2>{t("clusterTitle")}</h2>
          <p>{t("clusterBody")}</p>
        </header>

        <div className="showcase__regions">
          {clusterRegions.map((region) => (
            <div key={region.id} className="showcase__region">
              <p className="region-label">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="flag" src={region.flag} alt="" width={18} height={12} />
                {t(regionTitleKey(region.id))}
              </p>
              <div className="showcase__grid">
                {clusterKinds.map((kind) => {
                  const server = findClusterServer(region.id, kind.id);
                  if (!server) return null;
                  return (
                    <Link key={server.slug} className="showcase-card" href={`/servers/${server.slug}`}>
                      <strong>{t(kindTitleKey(kind.id))}</strong>
                      <span>{t(kindBlurbKey(kind.id))}</span>
                      <em>{serverHeadline(server)}</em>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
