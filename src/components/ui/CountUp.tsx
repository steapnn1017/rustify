"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const reduced = useReducedMotion();
  const [animated, setAnimated] = useState(value);
  const previous = useRef(value);
  const display = reduced ? value : animated;

  useEffect(() => {
    if (reduced) {
      previous.current = value;
      return;
    }
    const from = previous.current;
    if (from === value) return;
    let start: number | null = null;
    let frame = 0;
    const tick = (time: number) => {
      if (start == null) start = time;
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setAnimated(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previous.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);

  return <span className="mono">{display.toLocaleString("en-GB")}</span>;
}
