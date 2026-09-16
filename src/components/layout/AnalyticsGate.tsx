"use client";

import { useEffect } from "react";

export function AnalyticsGate() {
  useEffect(() => {
    const apply = () => {
      try {
        const raw = localStorage.getItem("rustify_consent");
        if (!raw) return;
        const consent = JSON.parse(raw) as { analytics?: boolean };
        if (consent.analytics && process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
          if (document.getElementById("plausible-script")) return;
          const script = document.createElement("script");
          script.id = "plausible-script";
          script.defer = true;
          script.dataset.domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
          script.src = "https://plausible.io/js/script.js";
          document.body.appendChild(script);
        }
      } catch {
        /* ignore */
      }
    };
    apply();
    window.addEventListener("rustify-consent", apply);
    return () => window.removeEventListener("rustify-consent", apply);
  }, []);
  return null;
}
