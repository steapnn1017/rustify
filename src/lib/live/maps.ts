import type { MapInfo } from "./types";

export type RustMapRecord = {
  id: string;
  seed: number;
  size: number;
  slug: "main" | "mondays" | "monthly";
};

/** Current wipe maps from RustMaps (assigned per server). */
export const rustMapsCatalog: RustMapRecord[] = [
  {
    slug: "main",
    id: "81711b818f5d4f4bad9036203ea126c8",
    seed: 608632069,
    size: 4750,
  },
  {
    slug: "mondays",
    id: "636f5b63289b4ce3bd2c4296f06ee308",
    seed: 1464861868,
    size: 4750,
  },
  {
    slug: "monthly",
    id: "86a29658e3a14a6bad64b874c72758c7",
    seed: 1659447160,
    size: 4750,
  },
];

export function rustMapsPageUrl(id: string) {
  return `https://rustmaps.com/map/${id}`;
}

export function mapBySlug(slug: string): RustMapRecord {
  return rustMapsCatalog.find((item) => item.slug === slug) ?? rustMapsCatalog[0]!;
}

export function mapInfo(slug: string): MapInfo {
  const map = mapBySlug(slug);
  return {
    name: `Procedural ${map.size}`,
    seed: map.seed,
    size: map.size,
    rustMapsId: map.id,
    thumbnailUrl: `/maps/${map.slug}.webp`,
    imageUrl: `/maps/${map.slug}.png`,
    interactiveUrl: rustMapsPageUrl(map.id),
  };
}

export function mapSvg(seed: number, size: number) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Map ${size} seed ${seed}">
  <rect width="100" height="100" fill="#111"/>
  <text x="50" y="52" text-anchor="middle" fill="#888" font-size="6" font-family="sans-serif">${size}</text>
</svg>`;
}
