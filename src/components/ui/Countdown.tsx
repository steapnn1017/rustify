"use client";

import { useEffect, useState } from "react";
import { formatRemaining } from "@/lib/format";

export function Countdown({ target, className }: { target: string; className?: string }) {
  const [label, setLabel] = useState("…");

  useEffect(() => {
    const tick = () => setLabel(formatRemaining(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return (
    <time className={className} dateTime={target} suppressHydrationWarning>
      {label}
    </time>
  );
}
