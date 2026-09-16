"use client";

import Link from "next/link";
import { legalNav, site } from "@/lib/site";
import { useT } from "@/lib/i18n/I18nProvider";

const legalKeys = {
  "/legal/terms": "legalTerms",
  "/legal/privacy": "legalPrivacy",
  "/legal/cookies": "legalCookies",
  "/legal/complaints": "legalComplaints",
  "/legal/imprint": "legalOperator",
} as const;

export function SiteFooter() {
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {year} {site.name}. {t("rights")}
        </p>
        <nav aria-label="Legal">
          {legalNav.slice(0, 3).map((item) => (
            <Link key={item.href} href={item.href}>
              {t(legalKeys[item.href])}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
