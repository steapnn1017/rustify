"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const KEY = "rustify_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(false);
    }
  }, []);

  function save(next: Consent) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...next, at: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("rustify-consent"));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-title">
      <div className="container cookie-banner__inner">
        <div>
          <h2 id="cookie-title">Cookies</h2>
          <p>
            Necessary cookies keep you signed in and remember this choice. Analytics and marketing
            cookies stay off until you allow them. Read the{" "}
            <Link href="/legal/cookies">cookie policy</Link>.
          </p>
        </div>
        <div>
          {customize ? (
            <div className="form" style={{ marginBottom: 12 }}>
              <label className="check">
                <input type="checkbox" checked disabled readOnly />
                <span>Necessary — session and consent (always on)</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                />
                <span>Analytics</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(event) => setMarketing(event.target.checked)}
                />
                <span>Marketing</span>
              </label>
            </div>
          ) : null}
          <div className="cookie-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => save({ necessary: true, analytics: true, marketing: true })}
            >
              Allow all
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => save({ necessary: true, analytics, marketing })}
            >
              {customize ? "Save choice" : "Necessary only"}
            </button>
            {customize ? null : (
              <button className="btn btn-ghost" type="button" onClick={() => setCustomize(true)}>
                Customize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
