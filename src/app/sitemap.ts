import type { MetadataRoute } from "next";
import { legalNav, site } from "@/lib/site";
import { serverCatalog } from "@/lib/live/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/servers", "/store", "/leaderboard", "/map-voting", "/support", "/account", ...legalNav.map((item) => item.href), ...serverCatalog.map((server) => `/servers/${server.slug}`)];
  return pages.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
  }));
}
