"use client";

import { useEffect, useRef } from "react";

type Notice = { id: string; title: string; body: string; href: string; createdAt: string };

export function NotifyBridge() {
  const seen = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const response = await fetch("/api/support/notifications", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as { notices?: Notice[]; prefs?: { browser?: boolean } };
      const browser = payload.prefs?.browser !== false;
      for (const notice of payload.notices ?? []) {
        if (seen.current.has(notice.id)) continue;
        seen.current.add(notice.id);
        if (!browser || typeof Notification === "undefined" || Notification.permission !== "granted") continue;
        const age = Date.now() - new Date(notice.createdAt).getTime();
        if (age > 5 * 60 * 1000) continue;
        new Notification(notice.title, { body: notice.body, data: { href: notice.href } });
      }
    }
    void tick();
    const timer = window.setInterval(() => void tick(), 20000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
