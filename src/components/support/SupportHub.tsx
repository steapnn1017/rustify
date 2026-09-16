import Link from "next/link";
import {
  Bell,
  Flag,
  Globe,
  MessageCircle,
  ShieldAlert,
  ShoppingBag,
  Siren,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { formatRelative } from "@/lib/format";
import { ticketCategories } from "@/lib/support/catalog";
import type { Ticket } from "@/lib/support/types";
import type { UserProfile } from "@/lib/users/store";

const icons = {
  report: Siren,
  appeal: Flag,
  whitelist: Globe,
  store: ShoppingBag,
  other: MessageCircle,
} as const;

export function SupportHub({
  user,
  profile,
  tickets,
  discordStatus,
  discordReady,
}: {
  user: SessionUser | null;
  profile: UserProfile | null;
  tickets: Ticket[];
  discordStatus?: string;
  discordReady: boolean;
}) {
  const discordLinked = Boolean(profile?.discord);
  const discordHref = `/api/auth/discord?returnTo=${encodeURIComponent("/support")}`;
  const steamHref = `/api/auth/steam?returnTo=${encodeURIComponent("/support")}`;
  const open = tickets.filter((ticket) => ticket.status === "open");
  const closed = tickets.filter((ticket) => ticket.status === "closed");
  const canOpenRestricted = Boolean(user && discordLinked);

  return (
    <section className="support">
      <div className="container support__inner">
        <h1>How can we help?</h1>

        {discordStatus === "linked" ? (
          <p className="alert">Discord linked. Staff got a review log for this Steam account.</p>
        ) : null}
        {discordStatus === "failed" ? (
          <p className="alert alert--error" role="alert">
            Discord linking failed. Check the redirect URI in the Discord app settings, then try again.
          </p>
        ) : null}

        {user ? (
          <div className="support-card">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" width={72} height={72} />
            ) : (
              <span className="support-card__fallback" aria-hidden="true" />
            )}
            <div className="support-card__body">
              <p>Welcome back,</p>
              <h2>{user.name}</h2>
              <div className="support-card__actions">
                <a
                  className="chip-link"
                  href={`https://steamcommunity.com/profiles/${user.steamId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Steam
                </a>
                {profile?.discord ? (
                  <span className="chip-link">
                    <span className="chip-link__dot" />
                    {profile.discord.globalName || profile.discord.username}
                  </span>
                ) : (
                  <a className="chip-link chip-link--action" href={discordReady ? discordHref : "/api/auth/discord/dev?returnTo=/support"}>
                    Link Discord
                  </a>
                )}
                <Link className="chip-link chip-link--bell" href="/support/settings">
                  <Bell size={14} strokeWidth={1.75} aria-hidden="true" />
                  You&apos;ll be told when staff reply
                  <strong>Manage</strong>
                </Link>
              </div>
              {!discordLinked ? (
                <p className="support-card__hint">
                  Link Discord to open reports, appeals, whitelist, and store tickets. Screening (VAC / game bans)
                  runs automatically and is sent to staff for accept / reject.
                </p>
              ) : profile?.discordReview?.status === "rejected" ? (
                <p className="support-card__hint support-card__hint--warn">
                  Staff rejected this Discord link. You can still write in Something else.
                </p>
              ) : profile?.discordReview?.status === "pending" ? (
                <p className="support-card__hint">Account review is pending with staff.</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="support-card support-card--login">
            <div>
              <h2>Sign in with Steam</h2>
              <p>
                Reports, appeals, whitelist, and store tickets need Steam plus a linked Discord. Something else can
                be opened without that.
              </p>
              <a className="btn btn-primary" href={steamHref}>
                Sign in with Steam
              </a>
            </div>
          </div>
        )}

        <div className="support-grid">
          {ticketCategories.map((item) => {
            const Icon = icons[item.id];
            const locked = item.requiresDiscord && !canOpenRestricted;
            const href = locked
              ? user
                ? discordReady
                  ? discordHref
                  : "/api/auth/discord/dev?returnTo=/support"
                : steamHref
              : `/support/new/${item.id}`;
            return (
              <Link
                key={item.id}
                className={item.id === "other" ? "support-tile support-tile--wide" : "support-tile"}
                href={href}
              >
                <span className="support-tile__icon" style={{ color: item.accent, borderColor: `${item.accent}55` }}>
                  {locked ? <ShieldAlert size={18} strokeWidth={1.75} /> : <Icon size={18} strokeWidth={1.75} />}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <em>
                    {locked
                      ? user
                        ? "Link Discord to open this queue."
                        : "Sign in with Steam, then link Discord."
                      : item.blurb}
                  </em>
                </span>
              </Link>
            );
          })}
        </div>

        {open.length ? (
          <TicketGroup title="Open tickets" count={open.length} tickets={open} />
        ) : null}
        <TicketGroup title="Closed tickets" count={closed.length} tickets={closed} empty="No closed tickets yet." />
      </div>
    </section>
  );
}

function TicketGroup({
  title,
  count,
  tickets,
  empty,
}: {
  title: string;
  count: number;
  tickets: Ticket[];
  empty?: string;
}) {
  return (
    <div className="ticket-group">
      <p className="ticket-group__label">
        {title} <span>{count}</span>
      </p>
      {tickets.length === 0 ? (
        <p className="support-empty">{empty}</p>
      ) : (
        <div className="ticket-rows">
          {tickets.map((ticket) => (
            <Link key={ticket.id} className="ticket-row" href={`/support/tickets/${ticket.id}`}>
              <span className="ticket-row__id">{ticket.publicId}</span>
              <span className="ticket-row__title">{ticket.title}</span>
              <span className="ticket-row__meta">{formatRelative(ticket.updatedAt)}</span>
              <span className={ticket.status === "closed" ? "ticket-status is-closed" : "ticket-status"}>
                {ticket.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
