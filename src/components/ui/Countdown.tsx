"use client";

import { useEffect, useState } from "react";
import { formatRemaining } from "@/lib/format";
import { useT } from "@/lib/i18n/I18nProvider";

export function Countdown({ target, className }: { target: string; className?: string }) {
  const t = useT();
  const [label, setLabel] = useState("…");

  useEffect(() => {
    const tick = () => setLabel(formatRemaining(target, Date.now(), t("wipeNow")));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, t]);

  return (
    <time className={className} dateTime={target} suppressHydrationWarning>
      {label}
    </time>
  );
}
