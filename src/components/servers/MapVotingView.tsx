"use client";

import Link from "next/link";
import type { SessionUser } from "@/lib/auth/session";
import type { ServerSnapshot } from "@/lib/live";
import { Countdown } from "@/components/ui/Countdown";
import { MapVote } from "./MapVote";
import { useT } from "@/lib/i18n/I18nProvider";

export function MapVotingView({
  servers,
  user,
}: {
  servers: ServerSnapshot[];
  user: SessionUser | null;
}) {
  const t = useT();
  return (
    <section className="vote-hub">
      <div className="container vote-hub__inner">
        <header className="page-intro">
          <p className="kicker">{t("voteKicker")}</p>
          <h1>{t("voteTitle")}</h1>
          <p>{t("voteBody")}</p>
        </header>

        <div className="vote-hub__list">
          {servers.map((server) => (
            <article key={server.slug} className="vote-block">
              <header className="vote-block__head">
                <div>
                  <span className={server.online ? "live" : "live is-off"}>
                    <i />
                    {server.online ? t("live") : t("offline")}
                  </span>
                  <h2>{server.name}</h2>
                  <p>{t("currentMap", { size: server.map.size, seed: server.map.seed })}</p>
                </div>
                <div className="vote-block__meta">
                  <div className="wipe-chip">
                    <span>{t("mapWipe")}</span>
                    <strong>
                      <Countdown target={server.wipeAt} />
                    </strong>
                  </div>
                  <Link className="btn btn-ghost btn-compact" href={`/servers/${server.slug}`}>
                    {t("serverPage")}
                  </Link>
                </div>
              </header>
              <MapVote
                slug={server.slug}
                options={server.votes}
                user={user}
                title={t("candidates")}
                returnTo="/map-voting"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
