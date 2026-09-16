import { ImageResponse } from "next/og";
import { getLiveProvider } from "@/lib/live";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const server = await getLiveProvider().getServer(slug);
  const title = server?.name ?? slug;
  const players = server ? `${server.players}/${server.maxPlayers}` : "—";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#06090D",
          color: "#E4EEF4",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#12B8C9" }}>{site.name}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 800 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 48, color: "#2EE6EA" }}>{players} live</div>
        </div>
      </div>
    ),
    size,
  );
}
