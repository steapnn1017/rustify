import { NextResponse } from "next/server";
import { serverCatalog } from "@/lib/live/catalog";
import { mapSvg } from "@/lib/live/maps";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = serverCatalog.find((item) => item.slug === slug);
  if (!config) return new NextResponse("Not found", { status: 404 });
  const body = mapSvg(config.seed, config.size);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
