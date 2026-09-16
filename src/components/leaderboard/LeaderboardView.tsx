"use client";

import { useMemo, useState } from "react";
import { Crown, Search } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/stats/leaderboard";
import { serverCatalog } from "@/lib/live/catalog";

export function LeaderboardView({
  entries,
  initialServerId = "all",
}: {
  entries: LeaderboardEntry[];
  initialServerId?: string;
}) {
  const [serverId, setServerId] = useState(initialServerId);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"kills" | "kd" | "playtimeHours">("kills");

  const filtered = useMemo(() => {
    let rows = entries;
    if (serverId !== "all") {
      rows = rows.filter((row) => row.serverId === serverId);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.steamId.includes(q),
      );
    }
    rows = [...rows].sort((a, b) => {
      if (sort === "kills") return b.kills - a.kills || b.kd - a.kd;
      if (sort === "kd") return b.kd - a.kd || b.kills - a.kills;
      return b.playtimeHours - a.playtimeHours || b.kills - a.kills;
    });
    return rows.map((row, index) => ({ ...row, rank: index + 1 }));
  }, [entries, serverId, query, sort]);

  const podium = filtered.slice(0, 3);
  const p1 = podium[0];
  const p2 = podium[1];
  const p3 = podium[2];

  return (
    <section className="lb">
      <div className="lb__glow" aria-hidden="true" />
      <div className="container">
        <header className="lb__head">
          <p className="kicker">Leaderboard</p>
          <h1>Who&apos;s dominating this wipe?</h1>
        </header>

        <div className="chip-tabs" role="tablist" aria-label="Server filter">
          <button
            type="button"
            className={serverId === "all" ? "chip is-active" : "chip"}
            onClick={() => setServerId("all")}
          >
            All servers
          </button>
          {serverCatalog.map((server) => (
            <button
              key={server.id}
              type="button"
              className={serverId === server.id ? "chip is-active" : "chip"}
              onClick={() => setServerId(server.id)}
            >
              {server.name}
            </button>
          ))}
        </div>

        <div className="lb__tools">
          <label className="lb-search">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              placeholder="Find a player by name or SteamID64…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="chip-tabs" role="tablist" aria-label="Sort">
            <button
              type="button"
              className={sort === "kills" ? "chip is-active" : "chip"}
              onClick={() => setSort("kills")}
            >
              Kills
            </button>
            <button
              type="button"
              className={sort === "kd" ? "chip is-active" : "chip"}
              onClick={() => setSort("kd")}
            >
              K/D
            </button>
            <button
              type="button"
              className={sort === "playtimeHours" ? "chip is-active" : "chip"}
              onClick={() => setSort("playtimeHours")}
            >
              Playtime
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="lb-empty">
            <h2>No stats yet</h2>
            <p>
              Leaderboard fills when the game plugin reports live player stats. Nothing here is
              simulated.
            </p>
          </div>
        ) : (
          <>
            <div className="lb-podium">
              <PodiumCard entry={p2} place={2} />
              <PodiumCard entry={p1} place={1} featured />
              <PodiumCard entry={p3} place={3} />
            </div>

            <div className="table-wrap lb-table-wrap">
              <table className="table lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Server</th>
                    <th>Kills</th>
                    <th>Deaths</th>
                    <th>K/D</th>
                    <th>Headshots</th>
                    <th>Playtime</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={`${row.steamId}:${row.serverId}`} className={row.rank <= 3 ? `is-top-${row.rank}` : undefined}>
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
                      <td>
                        {serverCatalog.find((s) => s.id === row.serverId)?.name ?? row.serverId}
                      </td>
                      <td>{row.kills}</td>
                      <td>{row.deaths}</td>
                      <td>{row.kd.toFixed(2)}</td>
                      <td>{row.headshots}</td>
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
}: {
  entry?: LeaderboardEntry;
  place: 1 | 2 | 3;
  featured?: boolean;
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
        <strong>{entry.kills}</strong> kills
      </p>
      <div className="lb-card__meta">
        <span>
          <b>{entry.deaths}</b> deaths
        </span>
        <span>
          <b>{entry.kd.toFixed(2)}</b> K/D
        </span>
      </div>
      <span className="lb-card__watermark" aria-hidden="true">
        {place}
      </span>
    </article>
  );
}
