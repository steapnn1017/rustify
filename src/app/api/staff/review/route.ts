import { NextResponse } from "next/server";
import { addMessage, listTickets } from "@/lib/support/store";
import { notifyPlayer } from "@/lib/support/screen";
import { readReviewToken } from "@/lib/staff/token";
import { getUserProfile, setDiscordReview } from "@/lib/users/store";
import { setWhitelistStatus } from "@/lib/whitelist/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") || "";
  const verdict = url.searchParams.get("v") === "reject" ? "reject" : "accept";
  const parsed = readReviewToken(token);
  if (!parsed || parsed.kind !== "discord") {
    return NextResponse.redirect(new URL("/support/review?ok=0", url.origin));
  }
  const profile = getUserProfile(parsed.steamId);
  const now = new Date().toISOString();
  const accepted = verdict === "accept";
  setDiscordReview(parsed.steamId, {
    status: accepted ? "accepted" : "rejected",
    flags: profile.discordReview?.flags ?? [],
    summary: profile.discordReview?.summary ?? "",
    createdAt: profile.discordReview?.createdAt ?? now,
    decidedAt: now,
    decidedBy: "discord-staff",
  });
  if (accepted) {
    setWhitelistStatus(parsed.steamId, "verified");
  }
  const related = listTickets({ steamId: parsed.steamId }).filter(
    (ticket) => ticket.type === "whitelist" && ticket.status === "open",
  );
  for (const ticket of related) {
    addMessage(ticket.id, {
      author: "system",
      authorName: "System",
      body: accepted
        ? "Staff accepted the Discord / Steam review. Whitelist can be applied on this account."
        : "Staff rejected this Discord / Steam review. This whitelist ticket will not be processed as-is.",
      createdAt: now,
    });
  }
  await notifyPlayer({
    steamId: parsed.steamId,
    title: accepted ? "Account review accepted" : "Account review rejected",
    body: accepted
      ? "Staff accepted your Discord link. You can keep using Support and whitelist requests on this Steam account."
      : "Staff rejected this Discord link. Open a support ticket if you think that is wrong.",
    href: "/support",
  });
  return NextResponse.redirect(new URL(`/support/review?ok=1&v=${verdict}`, url.origin));
}
