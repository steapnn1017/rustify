"use client";

import { useT } from "@/lib/i18n/I18nProvider";

export function SkipLink() {
  const t = useT();
  return (
    <a className="skip-link" href="#content">
      {t("skip")}
    </a>
  );
}
