"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  clusterKinds,
  clusterRegions,
  findClusterServer,
  regionFlag,
  serverHeadline,
} from "@/lib/live/catalog";
import type { ServerKind, ServerRegion } from "@/lib/live/types";
import { useT } from "@/lib/i18n/I18nProvider";

export function HomeOnboarding() {
  const t = useT();
  const [region, setRegion] = useState<ServerRegion | null>(null);
  const [kind, setKind] = useState<ServerKind | null>(null);
  const step = !region ? 1 : !kind ? 2 : 3;
  const match = region && kind ? findClusterServer(region, kind) : null;
  const kindMeta = useMemo(() => clusterKinds.find((item) => item.id === kind) ?? null, [kind]);
  const regionMeta = useMemo(() => clusterRegions.find((item) => item.id === region) ?? null, [region]);

  return (
    <div className="onboard">
      <p className="onboard__kicker">{t("onboard")}</p>
      <strong className="onboard__title">{t("findWipe")}</strong>
      <ol className="onboard__steps" aria-label={t("onboard")}>
        {[
          { key: "stepRegion" as const, label: t("stepRegion") },
          { key: "stepWipe" as const, label: t("stepWipe") },
          { key: "stepPlay" as const, label: t("stepPlay") },
        ].map((item, index) => {
          const n = index + 1;
          return (
            <li key={item.key} className={n === step ? "is-on" : n < step ? "is-done" : undefined}>
              <i>{n}</i>
              {item.label}
            </li>
          );
        })}
      </ol>

      {step === 1 ? (
        <div className="onboard__picks" role="group" aria-label={t("stepRegion")}>
          {clusterRegions.map((item) => (
            <button key={item.id} type="button" className="onboard__pick" onClick={() => setRegion(item.id)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="flag" src={item.flag} alt="" width={22} height={15} />
              {item.id === "us" ? t("unitedStates") : t("europe")}
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="onboard__picks onboard__picks--kinds" role="group" aria-label={t("stepWipe")}>
          {clusterKinds.map((item) => (
            <button key={item.id} type="button" className="onboard__pick" onClick={() => setKind(item.id)}>
              <b>{t(item.id === "main" ? "kindMain" : item.id === "mondays" ? "kindMondays" : item.id === "monthly" ? "kindMonthly" : "kindSdt")}</b>
              <span>{t(item.id === "main" ? "blurbMain" : item.id === "mondays" ? "blurbMondays" : item.id === "monthly" ? "blurbMonthly" : "blurbSdt")}</span>
            </button>
          ))}
          <button type="button" className="onboard__back" onClick={() => setRegion(null)}>
            {t("back")}
          </button>
        </div>
      ) : null}

      {step === 3 && match && kindMeta && regionMeta ? (
        <div className="onboard__result">
          <p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="flag" src={regionFlag(match.region)} alt="" width={18} height={12} />
            <strong>{serverHeadline(match)}</strong>
          </p>
          <em>{t(kindMeta.id === "main" ? "blurbMain" : kindMeta.id === "mondays" ? "blurbMondays" : kindMeta.id === "monthly" ? "blurbMonthly" : "blurbSdt")}</em>
          <div className="onboard__actions">
            <Link className="btn btn-primary" href={`/servers/${match.slug}`}>
              {t("openServer", {
                region: regionMeta.id === "us" ? t("unitedStates") : t("europe"),
                kind: t(kindMeta.id === "main" ? "kindMain" : kindMeta.id === "mondays" ? "kindMondays" : kindMeta.id === "monthly" ? "kindMonthly" : "kindSdt"),
              })}
              <ArrowRight size={15} strokeWidth={1.75} />
            </Link>
            <Link className="btn btn-ghost" href="/servers">
              {t("allServers")}
            </Link>
            <button
              type="button"
              className="onboard__back"
              onClick={() => {
                setKind(null);
              }}
            >
              {t("changeWipe")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
