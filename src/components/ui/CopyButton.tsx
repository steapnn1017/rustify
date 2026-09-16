"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  label,
  iconOnly = false,
}: {
  value: string;
  label: string;
  iconOnly?: boolean;
}) {
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
      aria-label={copied ? "Copied" : label || "Copy"}
      title={copied ? "Copied" : label || "Copy"}
    >
      {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
      {iconOnly ? null : copied ? "Copied" : label}
    </button>
  );
}
