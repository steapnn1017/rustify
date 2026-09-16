"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ExternalLink,
  Map as MapIcon,
  MessagesSquare,
  ShieldAlert,
  ShieldCheck,
  Users,
  User,
  UsersRound,
} from "lucide-react";
import type { ServerSummary } from "@/lib/live";
import type { WhitelistStatus } from "@/lib/whitelist/store";
import { regionFlag, serverHeadline } from "@/lib/live/catalog";
import { connectString, formatPlayers } from "@/lib/format";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { Countdown } from "@/components/ui/Countdown";
import { OccupancyBar } from "@/components/ui/OccupancyBar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useT } from "@/lib/i18n/I18nProvider";
import { kindWipeKey, regionTitleKey } from "@/lib/i18n/labels";
import type { Messages } from "@/lib/i18n/en";

function wipeProgress(wipeAt: string, kind: ServerSummary["kind"]) {
  const end = new Date(wipeAt).getTime();
  if (Number.isNaN(end)) return 0;
  const periodMs = kind === "monthly" ? 30 * 86400000 : 7 * 86400000;
  const start = end - periodMs;
  return Math.min(1, Math.max(0, (Date.now() - start) / periodMs));
}

const REGIONS = ["all", "eu", "us"] as const;
const TAGS = ["all", "2x", "vanilla", "solo", "duo", "trio", "team8"] as const;

type Region = (typeof REGIONS)[number];
type Tag = (typeof TAGS)[number];

function regionKey(item: Region): keyof Messages {
  if (item === "all") return "allRegions";
  return regionTitleKey(item);
}

function tagKey(item: Tag): keyof Messages | null {
  if (item === "all") return "allTags";
  if (item === "vanilla") return "vanillaStacks";
  if (item === "solo") return "solo";
  if (item === "duo") return "duo";
  if (item === "trio") return "trio";
  if (item === "team8") return "team8";
  return null;
}

function serverMatchesTag(server: ServerSummary, tag: Tag) {
  if (tag === "all") return true;
  if (tag === "2x" || tag === "vanilla") return true;
  if (tag === "team8") return server.kind !== "sdt";
  if (tag === "solo" || tag === "duo" || tag === "trio") return server.kind === "sdt";
  return true;
}

export function ServerCard({ server }: { server: ServerSummary }) {
  const t = useT();
  const ip = connectString(server.connect.host, server.connect.port);
  const progress = wipeProgress(server.wipeAt, server.kind);

  return (
    <article className="server">
      <div className="server__map">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={server.map.thumbnailUrl} alt={`${server.name} map`} />
        <a
          className="server__map-link"
          href={server.map.interactiveUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t("openMap")}
        >
          <ExternalLink size={14} strokeWidth={1.75} />
        </a>
        <span className="server__map-meta">
          <MapIcon size={12} strokeWidth={1.75} aria-hidden="true" />
          {server.map.size}
        </span>
      </div>

      <div className="server__body">
        <div className="server__head">
          <div className="server__title">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="flag" src={regionFlag(server.region)} alt="" width={22} height={15} />
            <h3>
              {serverHeadline(server)} | {t("vanilla")} | {server.map.size}
            </h3>
          </div>
          <span className={server.online ? "live" : "live is-off"}>
            <i />
            {server.online ? t("live") : t("offline")}
          </span>
        </div>

        <p className="server__desc">
          {t("wipeWeekly", { kind: t(kindWipeKey(server.kind)).toLowerCase(), team: server.kind === "sdt" ? "3" : "8" })}
          {server.queue > 0 ? ` ${t("queueCount", { n: server.queue })}` : ""} {t("seedValue", { n: server.map.seed })}
        </p>

        <div className="tags">
          <span className="is-whitelist">
            <ShieldAlert size={12} strokeWidth={1.75} aria-hidden="true" />
            {t("whitelist")}
          </span>
          <span>
            <MessagesSquare size={12} strokeWidth={1.75} aria-hidden="true" />
            {t("chatTranslation")}
          </span>
          {server.kind === "sdt" ? (
            <>
              <span>
                <User size={12} strokeWidth={1.75} aria-hidden="true" />
                {t("solo")}
              </span>
              <span>
                <UsersRound size={12} strokeWidth={1.75} aria-hidden="true" />
                {t("duo")}
              </span>
              <span>
                <Users size={12} strokeWidth={1.75} aria-hidden="true" />
                {t("trio")}
              </span>
            </>
          ) : (
            <span>
              <Users size={12} strokeWidth={1.75} aria-hidden="true" />
              {t("groupLimit", { n: 8 })}
            </span>
          )}
        </div>

        <div className="server__foot">
          <div className="meters">
            <div className="meter">
              <div className="meter__top">
                <span>{t("players")}</span>
                <strong>{formatPlayers(server.players, server.maxPlayers)}</strong>
              </div>
              <OccupancyBar value={server.players / server.maxPlayers} />
            </div>
            <div className="meter">
              <div className="meter__top">
                <span>{t("wipeCycle")}</span>
                <strong>
                  <Countdown target={server.wipeAt} />
                </strong>
              </div>
              <div className="bar bar--alt" aria-hidden="true">
                <span style={{ width: `${Math.max(4, Math.round(progress * 100))}%` }} />
              </div>
            </div>
          </div>
          <div className="server__actions">
            <ConnectButton host={server.connect.host} port={server.connect.port} />
            <CopyButton value={ip} label={t("copyIp")} iconOnly />
            <Link className="btn btn-ghost" href={`/servers/${server.slug}`}>
              {t("details")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ServerGrid({
  servers,
  whitelistStatus,
}: {
  servers: ServerSummary[];
  whitelistStatus: WhitelistStatus | null;
}) {
  const t = useT();
  const [region, setRegion] = useState<Region>("all");
  const [tag, setTag] = useState<Tag>("all");

  const filtered = useMemo(() => {
    return servers.filter((server) => {
      if (region !== "all" && server.region !== region) return false;
      if (!serverMatchesTag(server, tag)) return false;
      return true;
    });
  }, [servers, region, tag]);

  const byRegion = useMemo(() => {
    const groups = new Map<string, ServerSummary[]>();
    for (const server of filtered) {
      const key = server.region;
      const list = groups.get(key) ?? [];
      list.push(server);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <section className="servers" id="servers">
      <div className="container">
        <header className="page-intro servers-intro">
          <p className="kicker">{t("serversKicker")}</p>
          <h1>{t("serversTitle")}</h1>
        </header>
        <div className="filters">
          <Dropdown
            label={t("stepRegion")}
            valueLabel={region === "all" ? t("stepRegion") : t(regionKey(region))}
            buttonClassName={region !== "all" ? "filter is-on" : "filter"}
          >
            {(close) =>
              REGIONS.map((item) => (
                <DropdownItem
                  key={item}
                  active={region === item}
                  onSelect={() => {
                    setRegion(item);
                    close();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {item === "eu" ? <img className="flag" src="/flags/eu.svg" alt="" width={18} height={12} /> : null}
                  {item === "us" ? <img className="flag" src="/flags/us.svg" alt="" width={18} height={12} /> : null}
                  {t(regionKey(item))}
                </DropdownItem>
              ))
            }
          </Dropdown>

          <Dropdown
            label={t("tags")}
            valueLabel={tag === "all" ? t("tags") : tagKey(tag) ? t(tagKey(tag)!) : tag}
            buttonClassName={tag !== "all" ? "filter is-on" : "filter"}
          >
            {(close) =>
              TAGS.map((item) => (
                <DropdownItem
                  key={item}
                  active={tag === item}
                  onSelect={() => {
                    setTag(item);
                    close();
                  }}
                >
                  {tagKey(item) ? t(tagKey(item)!) : item}
                </DropdownItem>
              ))
            }
          </Dropdown>
        </div>

        <aside className="wl-banner">
          <span className="wl-banner__icon" aria-hidden="true">
            {whitelistStatus === "verified" ? (
              <ShieldCheck size={18} strokeWidth={1.75} />
            ) : (
              <ShieldAlert size={18} strokeWidth={1.75} />
            )}
          </span>
          <div className="wl-banner__copy">
            <strong>{t("whitelist")}</strong>
            {whitelistStatus === "verified" ? (
              <p>{t("wlVerified")}</p>
            ) : whitelistStatus === "pending" ? (
              <p>{t("wlPending")}</p>
            ) : (
              <p>{t("wlNeed")}</p>
            )}
          </div>
          <Link className="btn btn-primary" href="/support">
            {t("requestNow")}
          </Link>
        </aside>

        {byRegion.length === 0 ? (
          <p className="filters-empty">{t("serversEmpty")}</p>
        ) : (
          byRegion.map(([key, list]) => (
            <div key={key} className="region-block">
              <p className="region-label">{t(regionTitleKey(key as "eu" | "us"))}</p>
              <div className="server-list">
                {list.map((server) => (
                  <ServerCard key={server.id} server={server} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
