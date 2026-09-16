"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import type { VoteOption } from "@/lib/live/types";

export function MapVote({
  slug,
  options,
  user,
}: {
  slug: string;
  options: VoteOption[];
  user: SessionUser | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const total = options.reduce((sum, option) => sum + option.votes, 0) || 1;

  async function vote(optionId: string) {
    if (!user) {
      router.push(`/api/auth/steam?returnTo=/servers/${slug}`);
      return;
    }
    setPending(true);
    setError(null);
    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, optionId }),
    });
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error || "Vote failed");
      setPending(false);
      return;
    }
    setPending(false);
    router.refresh();
  }

  return (
    <section className="vote soft-panel">
      <header className="vote__head">
        <h2>Next map vote</h2>
        <p>{user ? "One vote per wipe." : "Sign in with Steam to vote."}</p>
      </header>

      <div className="vote-grid">
        {options.map((option) => {
          const pct = Math.round((option.votes / total) * 100);
          return (
            <button
              key={option.id}
              className="vote-card"
              type="button"
              disabled={pending}
              onClick={() => vote(option.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={option.thumbnailUrl} alt="" />
              <span className="vote-card__body">
                <strong>
                  {option.size}
                  <em className="mono">{option.seed}</em>
                </strong>
                <span className="vote-card__bar" aria-hidden="true">
                  <i style={{ width: `${Math.max(8, pct)}%` }} />
                </span>
                <span className="vote-card__meta">
                  {option.votes} votes · {pct}%
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="alert alert--error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
