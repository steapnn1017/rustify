import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getLiveProvider } from "@/lib/live";
import { castVote } from "@/lib/votes/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in with Steam to vote." }, { status: 401 });
  const body = (await request.json()) as { slug?: string; optionId?: string };
  if (!body.slug || !body.optionId) {
    return NextResponse.json({ error: "Missing vote." }, { status: 400 });
  }
  const server = await getLiveProvider().getServer(body.slug);
  if (!server) return NextResponse.json({ error: "Unknown server." }, { status: 404 });
  try {
    const tallies = castVote({ steamId: user.steamId, slug: body.slug, optionId: body.optionId });
    return NextResponse.json({ ok: true, tallies });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Vote failed" },
      { status: 400 },
    );
  }
}
