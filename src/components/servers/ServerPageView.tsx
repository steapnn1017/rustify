"use client";

import Link from "next/link";
import { ExternalLink, Map as MapIcon } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import type { ServerSnapshot } from "@/lib/live";
import { connectString, formatPlayers } from "@/lib/format";
import { regionFlag, serverHeadline } from "@/lib/live/catalog";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { Countdown } from "@/components/ui/Countdown";
import { OccupancyBar } from "@/components/ui/OccupancyBar";
import { MapVote } from "./MapVote";
import { RulesetGrid } from "./RulesetGrid";
import { useT } from "@/lib/i18n/I18nProvider";
import { kindTitleKey } from "@/lib/i18n/labels";

export function ServerPageView({
  server,
  user,
}: {
  server: ServerSnapshot;
  user: SessionUser | null;
}) {
  const t = useT();
  const ip = connectString(server.connect.host, server.connect.port);

  return (
    <div className="overview">
      <section className="overview__top">
        <div className="container overview__head">
          <div className="overview__title">
            <div className="overview__badges">
              <span className={server.online ? "live" : "live is-off"}>
                <i />
                {server.online ? t("live") : t("offline")}
              </span>
              <span className="overview__kind">{t(kindTitleKey(server.kind))}</span>
            </div>
            <h1>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="flag" src={regionFlag(server.region)} alt="" width={26} height={17} />
              {serverHeadline(server)}
            </h1>
            <div className="overview__players">
              <div className="meter__top">
                <span>{t("players")}</span>
                <strong>{formatPlayers(server.players, server.maxPlayers)}</strong>
              </div>
              <OccupancyBar value={server.players / server.maxPlayers} />
            </div>
            <div className="overview__actions">
              <ConnectButton host={server.connect.host} port={server.connect.port} />
              <CopyButton value={ip} label={t("copyIp")} iconOnly />
              <Link className="btn btn-ghost" href={`/store?server=${server.slug}`}>
                {t("navStore")}
              </Link>
            </div>
          </div>

          <div className="overview__wipes">
            <div className="wipe-chip">
              <span>{t("mapWipe")}</span>
              <strong>
                <Countdown target={server.wipeAt} />
              </strong>
            </div>
            <div className="wipe-chip">
              <span>{t("bpWipe")}</span>
              <strong>
                <Countdown target={server.bpWipeAt} />
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="overview__body">
        <div className="container overview__layout">
          <article className="map-card">
            <div className="map-card__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={server.map.imageUrl} alt={`Rust map ${server.map.size}`} />
              <a
                className="map-card__open"
                href={server.map.interactiveUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={15} strokeWidth={1.75} />
                RustMaps
              </a>
            </div>
            <div className="map-card__meta">
              <span>
                <MapIcon size={14} strokeWidth={1.75} aria-hidden="true" />
                {server.map.size}
              </span>
              <span className="mono">{t("seedValue", { n: server.map.seed })}</span>
            </div>
          </article>

          <aside className="overview__side">
            <div className="soft-panel overview-panel">
              <h2>{t("rules")}</h2>
              <RulesetGrid ruleset={server.ruleset} />
              <ul className="note-list">
                {server.rulesNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              <a className="btn btn-ghost" href={server.discordChannelUrl} rel="noreferrer" target="_blank">
                Discord
              </a>
            </div>
          </aside>

          <div className="overview__vote">
            <MapVote slug={server.slug} options={server.votes} user={user} />
          </div>
        </div>
      </section>
    </div>
  );
}
