import { NextResponse } from "next/server";
import { getLiveProvider } from "@/lib/live";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const server = await getLiveProvider().getServer(slug);
  if (!server) return NextResponse.json({ error: "Unknown server" }, { status: 404 });
  return NextResponse.json(server);
}
