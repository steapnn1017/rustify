"use client";

import Link from "next/link";
import { legalNav } from "@/lib/site";
import { useT } from "@/lib/i18n/I18nProvider";

const legalKeys = {
  "/legal/terms": "legalTerms",
  "/legal/privacy": "legalPrivacy",
  "/legal/cookies": "legalCookies",
  "/legal/complaints": "legalComplaints",
  "/legal/imprint": "legalOperator",
} as const;

export function LegalFrame({
  title,
  current,
  children,
}: {
  title: string;
  current: string;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <div className="container legal-page">
      <nav className="legal-nav" aria-label={t("legalOperator")}>
        {legalNav.map((item) => (
          <Link key={item.href} href={item.href} aria-current={item.href === current ? "page" : undefined}>
            {t(legalKeys[item.href])}
          </Link>
        ))}
      </nav>
      <article className="prose">
        <h1>{title}</h1>
        <p className="legal-note">{t("legalNote")}</p>
        {children}
      </article>
    </div>
  );
}
