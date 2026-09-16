import type { Metadata } from "next";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { getSession } from "@/lib/auth/session";
import { loadSteamProfile } from "@/lib/auth/steam";
import { listLeaderboard } from "@/lib/stats/leaderboard";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: `Wipe leaderboard for ${site.name}. Live stats from the game servers.`,
};

export default async function LeaderboardPage() {
  const user = await getSession();
  const raw = listLeaderboard();
  const uniqueIds = [...new Set(raw.filter((row) => row.source === "live").map((row) => row.steamId))].slice(
    0,
    40,
  );
  const profiles = await Promise.all(
    uniqueIds.map(async (steamId) => {
      const profile = await loadSteamProfile(steamId);
      return [steamId, profile] as const;
    }),
  );
  const byId = Object.fromEntries(profiles);
  const entries = raw.map((row) => ({
    ...row,
    name: byId[row.steamId]?.name || row.name,
    avatar: byId[row.steamId]?.avatar || row.avatar || "",
  }));

  return <LeaderboardView entries={entries} currentSteamId={user?.steamId} />;
}
