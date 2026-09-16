import type { Messages } from "./en";
import type { ServerKind, ServerRegion } from "@/lib/live/types";

export function kindTitleKey(kind: ServerKind): keyof Messages {
  if (kind === "main") return "kindMain";
  if (kind === "mondays") return "kindMondays";
  if (kind === "monthly") return "kindMonthly";
  return "kindSdt";
}

export function kindBlurbKey(kind: ServerKind): keyof Messages {
  if (kind === "main") return "blurbMain";
  if (kind === "mondays") return "blurbMondays";
  if (kind === "monthly") return "blurbMonthly";
  return "blurbSdt";
}

export function kindWipeKey(kind: ServerKind): keyof Messages {
  if (kind === "main") return "weekly";
  if (kind === "mondays") return "mondays";
  if (kind === "monthly") return "monthly";
  return "sdt";
}

export function regionTitleKey(region: ServerRegion): keyof Messages {
  return region === "us" ? "unitedStates" : "europe";
}

export function catTitleKey(id: string): keyof Messages {
  const map: Record<string, keyof Messages> = {
    pvp: "catPvp",
    scientists: "catScientists",
    resources: "catResources",
    gambling: "catGambling",
    raiding: "catRaiding",
    events: "catEvents",
    puzzles: "catPuzzles",
    bought: "catBought",
    looting: "catLooting",
    building: "catBuilding",
  };
  return map[id] ?? "catPvp";
}

export function supportCatKey(id: string): { title: keyof Messages; blurb: keyof Messages } {
  const map: Record<string, { title: keyof Messages; blurb: keyof Messages }> = {
    report: { title: "catReport", blurb: "catReportBlurb" },
    appeal: { title: "catAppeal", blurb: "catAppealBlurb" },
    whitelist: { title: "catWhitelist", blurb: "catWhitelistBlurb" },
    store: { title: "catStore", blurb: "catStoreBlurb" },
    other: { title: "catOther", blurb: "catOtherBlurb" },
  };
  return map[id] ?? map.other;
}
