"use client";

import Link from "next/link";
import { ChevronRight, FastForward } from "lucide-react";
import { site } from "@/lib/site";
import { HomeOnboarding } from "./HomeOnboarding";
import { useT } from "@/lib/i18n/I18nProvider";

export function Hero() {
  const t = useT();
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-bg.svg" alt="" />
        <div className="hero__veil" />
      </div>

      <div className="container hero__content">
        <div className="hero__logo">
          <span className="brand__mark brand__mark--lg" aria-hidden="true">
            R
          </span>
          <h1>{site.shortName}</h1>
        </div>
        <p className="hero__tag">{t("homeTagline")}</p>

        <HomeOnboarding />

        <Link className="hero-cta" href="/store">
          <span className="hero-cta__icon" aria-hidden="true">
            <FastForward size={18} strokeWidth={2} />
          </span>
          <span>
            <strong>{t("skipTitle")}</strong>
            <em>{t("skipSub")}</em>
          </span>
          <span className="hero-cta__arrows" aria-hidden="true">
            <ChevronRight size={16} />
            <ChevronRight size={16} />
            <ChevronRight size={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}
