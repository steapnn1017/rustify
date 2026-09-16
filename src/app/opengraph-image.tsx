import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { getLiveProvider } from "@/lib/live";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const cluster = await getLiveProvider().getCluster();
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 18, height: 18, background: "#2EE6EA", marginRight: 16 }} />
          <div style={{ display: "flex", fontSize: 28, letterSpacing: 6 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "#2EE6EA" }}>
            {`${cluster.playersOnline} online`}
          </div>
          <div style={{ display: "flex", fontSize: 36, color: "#9AADC0" }}>
            {`${cluster.serversUp}/${cluster.serversTotal} servers · 2x`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
