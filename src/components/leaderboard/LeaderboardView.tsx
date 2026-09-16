"use client";

import { useMemo, useState } from "react";
import {
  Backpack,
  Bot,
  CalendarDays,
  Crosshair,
  Crown,
  Dices,
  Hammer,
  LocateFixed,
  Pickaxe,
  Puzzle,
  Search,
  ShoppingCart,
  Sparkles,
  Swords,
} from "lucide-react";
import type { LeaderboardEntry } from "@/lib/stats/leaderboard";
import { serverCatalog, serverHeadline } from "@/lib/live/catalog";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useT } from "@/lib/i18n/I18nProvider";
import { catTitleKey } from "@/lib/i18n/labels";
import type { Messages } from "@/lib/i18n/en";

const CATEGORIES = [
  { id: "pvp", Icon: Crosshair },
  { id: "scientists", Icon: Bot },
  { id: "resources", Icon: Pickaxe },
  { id: "gambling", Icon: Dices },
  { id: "raiding", Icon: Swords },
  { id: "events", Icon: CalendarDays },
  { id: "puzzles", Icon: Puzzle },
  { id: "bought", Icon: ShoppingCart },
  { id: "looting", Icon: Backpack },
  { id: "building", Icon: Hammer },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];
type RangeId = "all-time" | "prime";
type WipeId = "current" | "all";

function categoryScore(row: LeaderboardEntry, category: CategoryId) {
  if (category === "pvp") return row.kills;
  if (category === "scientists") return row.scientists ?? row.headshots;
  if (category === "resources") return row.resourcesGathered;
  if (category === "gambling") return row.gambling ?? 0;
  if (category === "raiding") return row.raiding ?? Math.round(row.kills * 0.2);
  if (category === "events") return row.events ?? Math.round(row.playtimeHours / 8);
  if (category === "puzzles") return row.puzzles ?? 0;
  if (category === "bought") return row.bought ?? 0;
  if (category === "looting") return row.looting ?? Math.round(row.resourcesGathered / 40);
  return row.structuresBuilt;
}

function metricKey(category: CategoryId): keyof Messages {
  if (category === "pvp") return "metricKills";
  if (category === "scientists") return "catScientists";
  if (category === "resources") return "metricGathered";
  if (category === "gambling") return "metricGambled";
  if (category === "raiding") return "metricRaids";
  if (category === "events") return "catEvents";
  if (category === "puzzles") return "catPuzzles";
  if (category === "bought") return "catBought";
  if (category === "looting") return "metricLooted";
  return "metricBuilt";
}

function formatScore(category: CategoryId, value: number) {
  if (category === "resources") return value.toLocaleString("en-US");
  return value.toLocaleString("en-US");
}

function parseQuery(raw: string) {
  const value = raw.trim();
  const profile = value.match(/steamcommunity\.com\/(?:profiles|id)\/([^/?#]+)/i);
  if (profile?.[1] && /^\d{17}$/.test(profile[1])) return profile[1];
  return value.toLowerCase();
}

export function LeaderboardView({
  entries,
  initialServerId = "all",
  currentSteamId,
}: {
  entries: LeaderboardEntry[];
  initialServerId?: string;
  currentSteamId?: string;
}) {
  const t = useT();
  const [serverId, setServerId] = useState(initialServerId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("pvp");
  const [range, setRange] = useState<RangeId>("all-time");
  const [wipe, setWipe] = useState<WipeId>("current");
  const [findHint, setFindHint] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = entries;
    if (wipe === "all") {
      /* mock data is one wipe; keep the same set */
    }
    if (serverId !== "all") {
      rows = rows.filter((row) => row.serverId === serverId);
    }
    const q = parseQuery(query);
    if (q) {
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.steamId.includes(q) ||
          `https://steamcommunity.com/profiles/${row.steamId}`.includes(q),
      );
    }
    if (range === "prime") {
      rows = rows.filter((row) => row.playtimeHours >= 40 && row.kd >= 1.5);
    }
    rows = [...rows].sort((a, b) => {
      const diff = categoryScore(b, category) - categoryScore(a, category);
      if (diff !== 0) return diff;
      return b.kd - a.kd || b.kills - a.kills;
    });
    return rows.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [entries, serverId, query, category, range, wipe]);

  const podium = filtered.slice(0, 3);
  const serverLabel =
    serverId === "all" ? t("navServers") : (serverCatalog.find((item) => item.id === serverId)?.name ?? t("navServers"));

  function findMe() {
    if (!currentSteamId) {
      window.location.href = `/api/auth/steam?returnTo=${encodeURIComponent("/leaderboard")}`;
      return;
    }
    const match = filtered.find((row) => row.steamId === currentSteamId);
    if (!match) {
      setFindHint(t("notOnBoard"));
      return;
    }
    setFindHint(null);
    setQuery(currentSteamId);
    requestAnimationFrame(() => {
      document.getElementById(`lb-row-${match.steamId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <section className="lb">
      <div className="container">
        <header className="lb__head">
          <p className="kicker">{t("lbKicker")}</p>
          <h1>{t("lbTitle")}</h1>
        </header>

        <div className="lb-mode" role="tablist" aria-label="Range">
          <button
            type="button"
            className={range === "all-time" ? "is-on" : undefined}
            onClick={() => setRange("all-time")}
          >
            {t("allTime")}
          </button>
          <button type="button" className={range === "prime" ? "is-on" : undefined} onClick={() => setRange("prime")}>
            <Sparkles size={14} strokeWidth={1.75} />
            {t("prime")}
          </button>
        </div>

        <div className="lb-cats" role="tablist" aria-label="Category">
          {CATEGORIES.map((item) => {
            const Icon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                className={item.id === category ? "is-on" : undefined}
                onClick={() => setCategory(item.id)}
              >
                <Icon size={15} strokeWidth={1.75} />
                {t(catTitleKey(item.id))}
              </button>
            );
          })}
        </div>

        <div className="lb-toolbar">
          <label className="lb-search">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              placeholder={t("lbSearch")}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setFindHint(null);
              }}
            />
          </label>
          <Dropdown label={t("navServers")} valueLabel={serverLabel} buttonClassName="lb-dd">
            {(close) => (
              <>
                <DropdownItem
                  active={serverId === "all"}
                  onSelect={() => {
                    setServerId("all");
                    close();
                  }}
                >
                  {t("allServers")}
                </DropdownItem>
                {serverCatalog.map((server) => (
                  <DropdownItem
                    key={server.id}
                    active={serverId === server.id}
                    onSelect={() => {
                      setServerId(server.id);
                      close();
                    }}
                  >
                    {serverHeadline(server)}
                  </DropdownItem>
                ))}
              </>
            )}
          </Dropdown>
          <Dropdown label={t("stepWipe")} valueLabel={wipe === "current" ? t("currentWipe") : t("allWipes")} buttonClassName="lb-dd">
            {(close) => (
              <>
                <DropdownItem
                  active={wipe === "current"}
                  onSelect={() => {
                    setWipe("current");
                    close();
                  }}
                >
                  {t("currentWipe")}
                </DropdownItem>
                <DropdownItem
                  active={wipe === "all"}
                  onSelect={() => {
                    setWipe("all");
                    close();
                  }}
                >
                  {t("allWipes")}
                </DropdownItem>
              </>
            )}
          </Dropdown>
          <button className="lb-find" type="button" onClick={findMe}>
            <LocateFixed size={15} strokeWidth={1.75} />
            {t("findMe")}
          </button>
        </div>
        {findHint ? <p className="lb-hint">{findHint}</p> : null}

        {filtered.length === 0 ? (
          <div className="lb-empty">
            <h2>{t("noStats")}</h2>
            <p>{t("noStatsBody")}</p>
          </div>
        ) : (
          <>
            <div className="lb-podium">
              <PodiumCard entry={podium[1]} place={2} category={category} metric={t(metricKey(category))} playLabel={t("playShort")} kdLabel={t("kd")} />
              <PodiumCard entry={podium[0]} place={1} category={category} featured metric={t(metricKey(category))} playLabel={t("playShort")} kdLabel={t("kd")} />
              <PodiumCard entry={podium[2]} place={3} category={category} metric={t(metricKey(category))} playLabel={t("playShort")} kdLabel={t("kd")} />
            </div>

            <div className="table-wrap lb-table-wrap">
              <table className="table lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("player")}</th>
                    <th>{t("server")}</th>
                    <th>{t(metricKey(category))}</th>
                    {category === "pvp" ? (
                      <>
                        <th>{t("deaths")}</th>
                        <th>{t("kd")}</th>
                        <th>{t("headshots")}</th>
                      </>
                    ) : (
                      <th>{t("kd")}</th>
                    )}
                    <th>{t("playtime")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={`${row.steamId}:${row.serverId}`}
                      id={`lb-row-${row.steamId}`}
                      className={[row.rank <= 3 ? `is-top-${row.rank}` : "", row.steamId === currentSteamId ? "is-me" : ""]
                        .filter(Boolean)
                        .join(" ") || undefined}
                    >
                      <td className="lb-rank">{row.rank}</td>
                      <td>
                        <div className="lb-player">
                          {row.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.avatar} alt="" width={28} height={28} />
                          ) : (
                            <span className="lb-player__fallback" aria-hidden="true" />
                          )}
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td>{serverCatalog.find((item) => item.id === row.serverId)?.name ?? row.serverId}</td>
                      <td>{formatScore(category, categoryScore(row, category))}</td>
                      {category === "pvp" ? (
                        <>
                          <td>{row.deaths}</td>
                          <td>{row.kd.toFixed(2)}</td>
                          <td>{row.headshots}</td>
                        </>
                      ) : (
                        <td>{row.kd.toFixed(2)}</td>
                      )}
                      <td>{row.playtimeHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PodiumCard({
  entry,
  place,
  featured,
  category,
  metric,
  playLabel,
  kdLabel,
}: {
  entry?: LeaderboardEntry;
  place: 1 | 2 | 3;
  featured?: boolean;
  category: CategoryId;
  metric: string;
  playLabel: string;
  kdLabel: string;
}) {
  if (!entry) {
    return <div className={`lb-card lb-card--${place} is-empty`} aria-hidden="true" />;
  }

  return (
    <article className={featured ? `lb-card lb-card--${place} is-featured` : `lb-card lb-card--${place}`}>
      <div className="lb-card__rank">
        {place === 1 ? <Crown size={16} strokeWidth={1.75} aria-hidden="true" /> : null}
        <span>{place}</span>
      </div>
      {entry.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="lb-card__avatar" src={entry.avatar} alt="" width={56} height={56} />
      ) : (
        <span className="lb-card__avatar lb-card__avatar--empty" aria-hidden="true" />
      )}
      <h3>{entry.name}</h3>
      <p className="lb-card__stat">
        <strong>{formatScore(category, categoryScore(entry, category))}</strong> {metric.toLowerCase()}
      </p>
      <div className="lb-card__meta">
        <span>
          <b>{entry.kd.toFixed(2)}</b> {kdLabel}
        </span>
        <span>
          <b>{entry.playtimeHours}h</b> {playLabel}
        </span>
      </div>
      <span className="lb-card__watermark" aria-hidden="true">
        {place}
      </span>
    </article>
  );
}
