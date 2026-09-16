"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, MonitorSmartphone, MessageCircle } from "lucide-react";
import type { NotificationPrefs } from "@/lib/support/types";
import type { DiscordLink } from "@/lib/users/store";

export function NotifySettings({
  prefs,
  discord,
}: {
  prefs: NotificationPrefs;
  discord: DiscordLink | null;
}) {
  const [discordDm, setDiscordDm] = useState(prefs.discordDm);
  const [browser, setBrowser] = useState(prefs.browser);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  async function save(next: Partial<NotificationPrefs>) {
    setSaving(true);
    await fetch("/api/support/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setSaving(false);
  }

  async function enableBrowser() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setBrowser(true);
      await save({ browser: true });
      new Notification("Rustify Support", { body: "Browser alerts are on for this device." });
    }
  }

  return (
    <section className="support">
      <div className="container support__inner">
        <Link className="back-link" href="/support">
          Back to tickets
        </Link>
        <header className="page-intro">
          <h1>Notification settings</h1>
          <p>How we reach you when staff replies to a ticket on {discord?.globalName || discord?.username || "this account"}.</p>
        </header>

        <div className="settings-stack">
          <section className="soft-panel">
            <p className="kicker">How we reach you</p>
            <div className="settings-row">
              <span className="settings-ico" aria-hidden="true">
                <MessageCircle size={18} />
              </span>
              <div>
                <strong>Discord DM</strong>
                <p>
                  {discord
                    ? `Connected as ${discord.globalName || discord.username}. DMs need a bot token and open DMs.`
                    : "Link Discord first."}
                </p>
              </div>
              <button
                className={discordDm ? "chip is-active" : "chip"}
                type="button"
                disabled={!discord || saving}
                onClick={() => {
                  const next = !discordDm;
                  setDiscordDm(next);
                  void save({ discordDm: next });
                }}
              >
                {discordDm ? "On" : "Off"}
              </button>
            </div>
            <div className="settings-row">
              <span className="settings-ico" aria-hidden="true">
                <Bell size={18} />
              </span>
              <div>
                <strong>Browser alerts</strong>
                <p>Desktop notifications on this browser when a staff reply lands.</p>
              </div>
              {permission !== "granted" ? (
                <button className="btn btn-ghost btn-compact" type="button" onClick={() => void enableBrowser()}>
                  Turn on here
                </button>
              ) : (
                <button
                  className={browser ? "chip is-active" : "chip"}
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    const next = !browser;
                    setBrowser(next);
                    void save({ browser: next });
                  }}
                >
                  {browser ? "On" : "Off"}
                </button>
              )}
            </div>
          </section>

          <section className="soft-panel">
            <p className="kicker">This device</p>
            <div className="settings-row">
              <span className="settings-ico" aria-hidden="true">
                <MonitorSmartphone size={18} />
              </span>
              <div>
                <strong>Current browser</strong>
                <p>
                  {permission === "granted"
                    ? "Alerts allowed."
                    : permission === "unsupported"
                      ? "This browser cannot show notifications."
                      : "Permission not granted yet."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
