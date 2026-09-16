"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Lock } from "lucide-react";
import { formatRelative } from "@/lib/format";
import { categoryById } from "@/lib/support/catalog";
import type { Ticket } from "@/lib/support/types";

export function TicketThread({ ticket, staff }: { ticket: Ticket; staff: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const category = categoryById(ticket.type);
  const closed = ticket.status === "closed";

  async function send(payload: { body?: string; close?: boolean }) {
    setPending(true);
    setError("");
    const response = await fetch(`/api/support/tickets/${ticket.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!response.ok) {
      setError(data?.error || "Could not update the ticket.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="support">
      <div className="container support__thread">
        <div className="thread-nav">
          <Link className="back-link" href="/support">
            Back to tickets
          </Link>
          <Link className="chip-link chip-link--bell" href="/support/settings">
            <Bell size={14} strokeWidth={1.75} />
            You&apos;ll be told when staff reply
            <strong>Manage</strong>
          </Link>
        </div>

        <article className="thread-head">
          <div className="thread-head__top">
            <span className="ticket-row__id">{ticket.publicId}</span>
            <span className={closed ? "ticket-status is-closed" : "ticket-status"}>{ticket.status}</span>
          </div>
          <p className="kicker">{category?.title}</p>
          <h1>{ticket.title}</h1>
          <div className="thread-people">
            <span>Opened by {ticket.playerName}</span>
            {ticket.discordName ? <span>Discord {ticket.discordName}</span> : null}
          </div>
        </article>

        {ticket.fields.length ? (
          <section className="thread-fields">
            {ticket.fields.map((field) => (
              <div key={field.key}>
                <strong>{field.label}</strong>
                <p>{field.value}</p>
              </div>
            ))}
          </section>
        ) : null}

        <div className="thread-log">
          {ticket.messages.map((message) => (
            <article
              key={message.id}
              className={
                message.author === "system"
                  ? "bubble bubble--system"
                  : message.author === "staff"
                    ? "bubble bubble--staff"
                    : "bubble"
              }
            >
              <header>
                <b>{message.authorName}</b>
                {message.author === "system" ? <span className="ticket-status">system</span> : null}
                <time>{formatRelative(message.createdAt)}</time>
              </header>
              <p>{message.body}</p>
            </article>
          ))}
        </div>

        {closed ? (
          <p className="thread-closed">
            <Lock size={14} /> This ticket is closed. You can no longer reply.
          </p>
        ) : (
          <form
            className="ticket-form"
            onSubmit={(event) => {
              event.preventDefault();
              const text = String(new FormData(event.currentTarget).get("body") || "");
              void send({ body: text });
              event.currentTarget.reset();
            }}
          >
            <label className="field">
              <span>Reply{staff ? " as staff" : ""}</span>
              <textarea name="body" rows={4} required placeholder="Write a reply…" />
            </label>
            {error ? (
              <p className="alert alert--error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="thread-actions">
              <button className="btn btn-primary" type="submit" disabled={pending}>
                Send
              </button>
              <button className="btn btn-ghost" type="button" disabled={pending} onClick={() => void send({ close: true })}>
                Close ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
