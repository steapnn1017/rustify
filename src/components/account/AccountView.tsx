"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import type { Entitlement } from "@/lib/entitlements/store";
import type { Purchase } from "@/lib/commerce/orders";
import type { PlayerStats } from "@/lib/stats";
import type { UserProfile } from "@/lib/users/store";
import { formatDateTime, formatUsd } from "@/lib/format";
import { Countdown } from "@/components/ui/Countdown";
import { entitlementScopeLabel, getTier } from "@/lib/store/catalog";
import { serverCatalog } from "@/lib/live/catalog";
import { useT } from "@/lib/i18n/I18nProvider";

function tierLabel(tier: string) {
  return getTier(tier)?.name ?? tier.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function serverLabel(serverId: string) {
  return entitlementScopeLabel(serverId);
}

export function AccountView({
  user,
  profile,
  purchases,
  entitlements,
  stats,
  discordReady,
  discordStatus,
}: {
  user: SessionUser;
  profile: UserProfile;
  purchases: Purchase[];
  entitlements: Entitlement[];
  stats: PlayerStats;
  discordReady: boolean;
  discordStatus?: string;
}) {
  const t = useT();
  const router = useRouter();
  const [serverId, setServerId] = useState(profile.statsServerId);
  const [pendingServer, setPendingServer] = useState(false);

  async function changeServer(nextId: string) {
    setServerId(nextId);
    setPendingServer(true);
    const response = await fetch("/api/account/stats-server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId: nextId }),
    });
    setPendingServer(false);
    if (response.ok) router.refresh();
  }

  return (
    <section className="account-page">
      <div className="container">
        <header className="account-top">
          <div className="account-top__identity">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" width={64} height={64} />
            ) : (
              <span className="account-top__fallback" aria-hidden="true" />
            )}
            <div>
              <h1>{user.name}</h1>
              <p className="mono account-top__id">{user.steamId}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="btn btn-ghost btn-compact" type="submit">
            {t("signOut")}
            </button>
          </form>
        </header>

        {discordStatus === "linked" ? <p className="alert">{t("discordLinkedShort")}</p> : null}
        {discordStatus === "failed" ? (
          <p className="alert alert--error" role="alert">
            {t("discordFailed")}
          </p>
        ) : null}

        <div className="account-layout">
          <aside className="account-side">
            <section className="soft-panel account-panel">
              <div className="account-panel__row">
                <h2>Discord</h2>
                {profile.discord ? (
                  <form action="/api/auth/discord/unlink" method="post">
                    <button className="btn btn-ghost btn-compact" type="submit">
                      Unlink
                    </button>
                  </form>
                ) : (
                  <a
                    className="btn btn-primary btn-compact"
                    href={discordReady ? "/api/auth/discord" : "/api/auth/discord/dev"}
                  >
                    {t("linkDiscord")}
                  </a>
                )}
              </div>
              {profile.discord ? (
                <div className="account-discord">
                  {profile.discord.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.discord.avatar} alt="" width={32} height={32} />
                  ) : (
                    <span className="user-chip__fallback" aria-hidden="true" />
                  )}
                  <strong>{profile.discord.globalName || profile.discord.username}</strong>
                </div>
              ) : (
                <p className="account-panel__hint">Required for appeals and whitelist.</p>
              )}
            </section>

            <section className="soft-panel account-panel">
              <div className="account-panel__row">
                <h2>Active</h2>
                {entitlements.length === 0 ? (
                  <Link className="btn btn-ghost btn-compact" href="/store">
                    {t("navStore")}
                  </Link>
                ) : null}
              </div>
              {entitlements.length === 0 ? (
                <p className="account-panel__hint">No active ranks.</p>
              ) : (
                <ul className="entitlement-list">
                  {entitlements.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{tierLabel(item.tier)}</strong>
                        <span>{serverLabel(item.serverId)}</span>
                      </div>
                      <em>
                        <Countdown target={item.endsAt} />
                      </em>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>

          <div className="account-main">
            <section className="soft-panel">
              <h2>Server stats</h2>
              <div className="chip-tabs" role="tablist" aria-label="Stats server">
                {serverCatalog.map((server) => (
                  <button
                    key={server.id}
                    type="button"
                    role="tab"
                    className={server.id === serverId ? "chip is-active" : "chip"}
                    aria-selected={server.id === serverId}
                    disabled={pendingServer}
                    onClick={() => changeServer(server.id)}
                  >
                    {server.name}
                  </button>
                ))}
              </div>
              <div className="stat-rail">
                <div>
                  <span>{t("metricKills")}</span>
                  <strong>{stats.kills}</strong>
                </div>
                <div>
                  <span>{t("deaths")}</span>
                  <strong>{stats.deaths}</strong>
                </div>
                <div>
                  <span>{t("kd")}</span>
                  <strong>{stats.kd.toFixed(2)}</strong>
                </div>
                <div>
                  <span>{t("playtime")}</span>
                  <strong>{stats.playtimeHours}h</strong>
                </div>
                <div>
                  <span>{t("headshots")}</span>
                  <strong>{stats.headshots}</strong>
                </div>
                <div>
                  <span>Structures</span>
                  <strong>{stats.structuresBuilt}</strong>
                </div>
                <div>
                  <span>Resources</span>
                  <strong>{stats.resourcesGathered.toLocaleString("en-GB")}</strong>
                </div>
                <div>
                  <span>Last seen</span>
                  <strong>{stats.lastSeenAt ? formatDateTime(stats.lastSeenAt) : "—"}</strong>
                </div>
              </div>
            </section>

            <section className="soft-panel">
              <h2>{t("purchases")}</h2>
              {purchases.length === 0 ? (
                <p className="account-panel__hint">No orders yet.</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t("invoice")}</th>
                        <th>{t("server")}</th>
                        <th>{t("vip")}</th>
                        <th>{t("amount")}</th>
                        <th>{t("status")}</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td>
                            <Link href={`/api/invoices/${purchase.invoiceId}`}>{purchase.invoiceId}</Link>
                          </td>
                          <td>{purchase.serverName}</td>
                          <td>{purchase.tier}</td>
                          <td>{formatUsd(purchase.amountCents)}</td>
                          <td>{purchase.status}</td>
                          <td>{formatDateTime(purchase.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
