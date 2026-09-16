import type { Metadata } from "next";
import Link from "next/link";
import { Flame } from "lucide-react";
import { getFreshSession } from "@/lib/auth/refresh";
import { getUserProfile } from "@/lib/users/store";
import { discordConfigured } from "@/lib/discord/oauth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support",
};

export default async function SupportPage() {
  const user = await getFreshSession();
  const profile = user ? getUserProfile(user.steamId) : null;
  const discordHref = discordConfigured() ? "/api/auth/discord" : "/api/auth/discord/dev";

  return (
    <section className="support">
      <div className="container support__inner">
        <h1>How can we help?</h1>

        {user ? (
          <div className="support-card">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" width={56} height={56} />
            ) : (
              <span className="support-card__fallback" aria-hidden="true" />
            )}
            <div>
              <p>Welcome back,</p>
              <h2>{user.name}</h2>
              <div className="support-card__actions">
                <a
                  className="btn btn-ghost"
                  href={`https://steamcommunity.com/profiles/${user.steamId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Steam
                </a>
                {profile?.discord ? (
                  <span className="btn btn-ghost">Discord linked</span>
                ) : (
                  <a className="btn btn-ghost" href={discordHref}>
                    Link Discord
                  </a>
                )}
                <Link className="btn btn-ghost" href="/account">
                  Account
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="support-card support-card--login">
            <div>
              <h2>Sign in to open tickets</h2>
              <p>Steam login is required for appeals and purchase support.</p>
              <a className="btn btn-primary" href="/api/auth/steam?returnTo=/support">
                Sign in with Steam
              </a>
            </div>
          </div>
        )}

        <a className="appeal" href={user ? discordHref : "/api/auth/steam?returnTo=/support"}>
          <span className="appeal__icon" aria-hidden="true">
            <Flame size={18} strokeWidth={1.75} />
          </span>
          <span>
            <strong>Submit an Appeal</strong>
            <em>{user ? "Click to link your Discord account." : "Sign in with Steam first."}</em>
          </span>
        </a>

        <p className="support-empty">You haven&apos;t opened any tickets yet.</p>
      </div>
    </section>
  );
}
