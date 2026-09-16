import Link from "next/link";
import type { SessionUser } from "@/lib/auth/session";
import type { ServerSnapshot } from "@/lib/live";
import { Countdown } from "@/components/ui/Countdown";
import { MapVote } from "./MapVote";

export function MapVotingView({
  servers,
  user,
}: {
  servers: ServerSnapshot[];
  user: SessionUser | null;
}) {
  return (
    <section className="vote-hub">
      <div className="container vote-hub__inner">
        <header className="page-intro">
          <p className="kicker">Cluster</p>
          <h1>Map Voting</h1>
          <p>
            Pick the next procedural for each wipe. One Steam vote per server, and you can change it until wipe
            lands.
          </p>
        </header>

        <div className="vote-hub__list">
          {servers.map((server) => (
            <article key={server.slug} className="vote-block">
              <header className="vote-block__head">
                <div>
                  <span className={server.online ? "live" : "live is-off"}>
                    <i />
                    {server.online ? "LIVE" : "OFFLINE"}
                  </span>
                  <h2>{server.name}</h2>
                  <p>
                    Current map {server.map.size} · seed {server.map.seed}
                  </p>
                </div>
                <div className="vote-block__meta">
                  <div className="wipe-chip">
                    <span>Map wipe</span>
                    <strong>
                      <Countdown target={server.wipeAt} />
                    </strong>
                  </div>
                  <Link className="btn btn-ghost btn-compact" href={`/servers/${server.slug}`}>
                    Server page
                  </Link>
                </div>
              </header>
              <MapVote
                slug={server.slug}
                options={server.votes}
                user={user}
                title="Candidates"
                returnTo="/map-voting"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
