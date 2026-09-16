"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

export function CopyButton({
  value,
  label,
  iconOnly = false,
}: {
  value: string;
  label: string;
  iconOnly?: boolean;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      className={iconOnly ? "btn btn-ghost btn-icon" : "btn btn-ghost btn-compact"}
      type="button"
      onClick={onCopy}
      aria-label={copied ? t("copied") : label || t("copy")}
      title={copied ? t("copied") : label || t("copy")}
    >
      {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
      {iconOnly ? null : copied ? t("copied") : label}
    </button>
  );
}
