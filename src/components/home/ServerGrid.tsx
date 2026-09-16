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
import { connectString, formatPlayers } from "@/lib/format";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { Countdown } from "@/components/ui/Countdown";
import { OccupancyBar } from "@/components/ui/OccupancyBar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

function wipeProgress(wipeAt: string, kind: ServerSummary["kind"]) {
  const end = new Date(wipeAt).getTime();
  if (Number.isNaN(end)) return 0;
  const periodMs = kind === "monthly" ? 30 * 86400000 : 7 * 86400000;
  const start = end - periodMs;
  return Math.min(1, Math.max(0, (Date.now() - start) / periodMs));
}

const kindLabel: Record<ServerSummary["kind"], string> = {
  main: "Weekly",
  mondays: "Mondays",
  monthly: "Monthly",
};

const REGIONS = ["all", "eu"] as const;
const TAGS = ["all", "2x", "vanilla", "solo", "duo", "trio", "team8"] as const;

type Region = (typeof REGIONS)[number];
type Tag = (typeof TAGS)[number];

const regionLabel: Record<Region, string> = { all: "All regions", eu: "Europe" };
const tagLabel: Record<Tag, string> = {
  all: "All tags",
  "2x": "2x",
  vanilla: "Vanilla stacks",
  solo: "Solo",
  duo: "Duo",
  trio: "Trio",
  team8: "Team 8",
};

function serverMatchesTag(server: ServerSummary, tag: Tag) {
  if (tag === "all") return true;
  if (tag === "2x" || tag === "vanilla" || tag === "team8") return true;
  if (tag === "solo" || tag === "duo" || tag === "trio") return true;
  return true;
}

export function ServerCard({ server }: { server: ServerSummary }) {
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
          aria-label="Open map"
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
            <img className="flag" src="/flags/eu.svg" alt="" width={22} height={15} />
            <h3>
              [EU] Rustify {server.name} | Vanilla | {server.map.size}
            </h3>
          </div>
          <span className={server.online ? "live" : "live is-off"}>
            <i />
            {server.online ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        <p className="server__desc">
          Wipe {kindLabel[server.kind].toLowerCase()} · 2× gather & loot · vanilla stacks · team UI 8.
          {server.queue > 0 ? ` Queue ${server.queue}.` : ""} Seed {server.map.seed}.
        </p>

        <div className="tags">
          <span className="is-whitelist">
            <ShieldAlert size={12} strokeWidth={1.75} aria-hidden="true" />
            Whitelist required
          </span>
          <span>
            <MessagesSquare size={12} strokeWidth={1.75} aria-hidden="true" />
            Chat Translation
          </span>
          <span>
            <Users size={12} strokeWidth={1.75} aria-hidden="true" />
            Group Limit
          </span>
          <span>
            <User size={12} strokeWidth={1.75} aria-hidden="true" />
            Solo
          </span>
          <span>
            <UsersRound size={12} strokeWidth={1.75} aria-hidden="true" />
            Duo
          </span>
          <span>
            <Users size={12} strokeWidth={1.75} aria-hidden="true" />
            Trio
          </span>
        </div>

        <div className="server__foot">
          <div className="meters">
            <div className="meter">
              <div className="meter__top">
                <span>Players</span>
                <strong>{formatPlayers(server.players, server.maxPlayers)}</strong>
              </div>
              <OccupancyBar value={server.players / server.maxPlayers} />
            </div>
            <div className="meter">
              <div className="meter__top">
                <span>Wipe cycle</span>
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
            <CopyButton value={ip} label="Copy IP" iconOnly />
            <Link className="btn btn-ghost" href={`/servers/${server.slug}`}>
              Details
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
  const [region, setRegion] = useState<Region>("eu");
  const [tag, setTag] = useState<Tag>("all");

  const filtered = useMemo(() => {
    return servers.filter((server) => {
      if (region !== "all" && region !== "eu") return false;
      if (!serverMatchesTag(server, tag)) return false;
      return true;
    });
  }, [servers, region, tag]);

  const byRegion = useMemo(() => {
    const groups = new Map<string, ServerSummary[]>();
    for (const server of filtered) {
      const key = "Europe";
      const list = groups.get(key) ?? [];
      list.push(server);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <section className="servers" id="servers">
      <div className="container">
        <div className="filters">
          <Dropdown
            label="Region"
            valueLabel={region === "all" ? "Region" : regionLabel[region]}
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
                  {regionLabel[item]}
                </DropdownItem>
              ))
            }
          </Dropdown>

          <Dropdown
            label="Tags"
            valueLabel={tag === "all" ? "Tags" : tagLabel[tag]}
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
                  {tagLabel[item]}
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
            <strong>Whitelist required</strong>
            {whitelistStatus === "verified" ? (
              <p>Your request was verified. You can join on the Steam account you signed in with.</p>
            ) : whitelistStatus === "pending" ? (
              <p>Request sent. Staff still has to verify it before you can join.</p>
            ) : (
              <p>
                To get whitelisted, open a request on Support. Staff has to verify it before you can join.
              </p>
            )}
          </div>
          <Link className="btn btn-primary" href="/support">
            Request now
          </Link>
        </aside>

        {byRegion.length === 0 ? (
          <p className="filters-empty">No servers match these filters.</p>
        ) : (
          byRegion.map(([label, list]) => (
            <div key={label} className="region-block">
              <p className="region-label">{label}</p>
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
