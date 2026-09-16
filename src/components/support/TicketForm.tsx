"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { serverCatalog } from "@/lib/live/catalog";
import { categoryById } from "@/lib/support/catalog";
import type { TicketField, TicketType } from "@/lib/support/types";

export function TicketForm({
  type,
  playerName,
  signedIn,
}: {
  type: TicketType;
  playerName: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const category = categoryById(type);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fields: TicketField[] = [];
    form.forEach((value, key) => {
      if (key === "title" || key === "playerName") return;
      const label = event.currentTarget.querySelector(`[name="${key}"]`)?.getAttribute("data-label") || key;
      fields.push({ key, label, value: String(value) });
    });
    setPending(true);
    setError("");
    const response = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title:
          String(form.get("title") || "") ||
          String(form.get("subject") || "") ||
          String(form.get("target") || "") ||
          String(form.get("kind") || "") ||
          String(form.get("punishment") || ""),
        playerName: String(form.get("playerName") || playerName),
        fields,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; ticket?: { id: string } } | null;
    setPending(false);
    if (!response.ok || !payload?.ticket) {
      setError(payload?.error || "Could not create the ticket.");
      return;
    }
    router.push(`/support/tickets/${payload.ticket.id}`);
    router.refresh();
  }

  return (
    <section className="support">
      <div className="container support__inner">
        <Link className="back-link" href="/support">
          Back to tickets
        </Link>
        <header className="page-intro">
          <p className="kicker">{category?.title}</p>
          <h1>Open a ticket</h1>
          <p>{category?.blurb}</p>
        </header>

        <form className="ticket-form" onSubmit={onSubmit}>
          {type === "report" ? (
            <>
              <Field name="target" label="Player SteamID64" placeholder="7656119…" required />
              <label className="field">
                <span>Server</span>
                <select name="server" data-label="Server" required>
                  {serverCatalog.map((server) => (
                    <option key={server.id} value={server.name}>
                      {server.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field name="what" label="What happened?" textarea required />
              <Field name="evidence" label="Evidence (clips, profiles)" textarea />
            </>
          ) : null}

          {type === "appeal" ? (
            <>
              <label className="field">
                <span>Punishment</span>
                <select name="punishment" data-label="Punishment" required>
                  <option value="Ban">Ban</option>
                  <option value="EAC / Game ban">EAC / Game ban</option>
                  <option value="Mute">Mute</option>
                </select>
              </label>
              <Field name="why" label="Why did you do it?" textarea required />
              <Field name="unban" label="Why should you be unbanned?" textarea required />
              <Field name="otherSteam" label="Other Steam accounts / SteamIDs" />
              <Field name="otherDiscord" label="Other Discord accounts" />
              <Field name="extra" label="Additional information" textarea />
            </>
          ) : null}

          {type === "whitelist" ? (
            <>
              <label className="field">
                <span>Request</span>
                <select name="kind" data-label="Request">
                  <option value="Whitelist">Whitelist</option>
                  <option value="VPN">VPN approval</option>
                </select>
              </label>
              <Field name="reason" label="Why do you need access?" textarea required />
            </>
          ) : null}

          {type === "store" ? (
            <>
              <Field name="invoice" label="Invoice / order id" />
              <Field name="issue" label="What went wrong?" textarea required />
            </>
          ) : null}

          {type === "other" ? (
            <>
              {!signedIn ? <Field name="playerName" label="Your name" required defaultValue={playerName} /> : null}
              <Field name="subject" label="Subject" required />
              <Field name="message" label="Message" textarea required />
            </>
          ) : null}

          {error ? (
            <p className="alert alert--error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Submit ticket"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  textarea,
  required,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  textarea?: boolean;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea name={name} data-label={label} required={required} rows={5} placeholder={placeholder} defaultValue={defaultValue} />
      ) : (
        <input name={name} data-label={label} required={required} placeholder={placeholder} defaultValue={defaultValue} />
      )}
    </label>
  );
}
