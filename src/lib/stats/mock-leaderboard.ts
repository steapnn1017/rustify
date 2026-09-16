import type { LeaderboardEntry, PlayerStats } from "./types";
import { serverCatalog } from "@/lib/live/catalog";

type MockPlayer = {
  name: string;
  serverId: string;
  kills: number;
  deaths: number;
  hours: number;
};

const PLAYERS: MockPlayer[] = [
  { name: "RaidHour", serverId: "main", kills: 412, deaths: 89, hours: 94 },
  { name: "HeliHunt", serverId: "main", kills: 378, deaths: 102, hours: 88 },
  { name: "ZergQueen", serverId: "mondays", kills: 351, deaths: 118, hours: 81 },
  { name: "Kryptek", serverId: "main", kills: 298, deaths: 121, hours: 76 },
  { name: "SoloSteve", serverId: "monthly", kills: 289, deaths: 76, hours: 102 },
  { name: "AKAnnie", serverId: "main", kills: 276, deaths: 98, hours: 71 },
  { name: "SaltyNate", serverId: "mondays", kills: 267, deaths: 109, hours: 69 },
  { name: "SilentPeak", serverId: "main", kills: 254, deaths: 87, hours: 68 },
  { name: "VoodooVince", serverId: "monthly", kills: 244, deaths: 83, hours: 91 },
  { name: "M249Maya", serverId: "main", kills: 241, deaths: 110, hours: 64 },
  { name: "PvpPete", serverId: "mondays", kills: 233, deaths: 96, hours: 62 },
  { name: "CompoundCara", serverId: "main", kills: 219, deaths: 95, hours: 61 },
  { name: "DeepSouth", serverId: "monthly", kills: 208, deaths: 97, hours: 84 },
  { name: "OilRigOtto", serverId: "main", kills: 201, deaths: 88, hours: 58 },
  { name: "ScrapLord", serverId: "mondays", kills: 198, deaths: 84, hours: 54 },
  { name: "C4Chris", serverId: "main", kills: 188, deaths: 104, hours: 55 },
  { name: "PythonPat", serverId: "mondays", kills: 184, deaths: 112, hours: 51 },
  { name: "TundraTom", serverId: "monthly", kills: 181, deaths: 88, hours: 77 },
  { name: "BradleyBen", serverId: "main", kills: 176, deaths: 91, hours: 52 },
  { name: "CargoCarl", serverId: "mondays", kills: 170, deaths: 90, hours: 47 },
  { name: "SatchelSue", serverId: "main", kills: 162, deaths: 99, hours: 48 },
  { name: "DesertFox", serverId: "monthly", kills: 159, deaths: 74, hours: 70 },
  { name: "LaunchLen", serverId: "main", kills: 151, deaths: 86, hours: 46 },
  { name: "TrainyardTy", serverId: "mondays", kills: 148, deaths: 79, hours: 44 },
  { name: "SulfurSam", serverId: "monthly", kills: 142, deaths: 101, hours: 63 },
  { name: "AirfieldAl", serverId: "main", kills: 139, deaths: 92, hours: 43 },
  { name: "BanditBetty", serverId: "mondays", kills: 136, deaths: 103, hours: 41 },
  { name: "OutpostOli", serverId: "main", kills: 128, deaths: 81, hours: 40 },
  { name: "LighthouseLi", serverId: "monthly", kills: 126, deaths: 69, hours: 58 },
  { name: "NightOwl", serverId: "mondays", kills: 121, deaths: 88, hours: 37 },
  { name: "RecycleRon", serverId: "main", kills: 117, deaths: 94, hours: 38 },
  { name: "CopperKid", serverId: "mondays", kills: 108, deaths: 95, hours: 34 },
  { name: "FarmGod", serverId: "main", kills: 104, deaths: 77, hours: 36 },
  { name: "BowOnly", serverId: "monthly", kills: 98, deaths: 54, hours: 49 },
  { name: "DoorCampDan", serverId: "mondays", kills: 91, deaths: 122, hours: 29 },
  { name: "BeachBob", serverId: "main", kills: 89, deaths: 101, hours: 31 },
  { name: "HermitHank", serverId: "monthly", kills: 81, deaths: 44, hours: 112 },
  { name: "RoofRat", serverId: "main", kills: 72, deaths: 118, hours: 28 },
  { name: "Snowman", serverId: "mondays", kills: 64, deaths: 71, hours: 22 },
  { name: "ChadFarm", serverId: "monthly", kills: 55, deaths: 39, hours: 41 },
];

function avatarFor(name: string) {
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(name)}&size=128`;
}

function toStats(player: MockPlayer, index: number): PlayerStats & { name: string; avatar: string } {
  const kd = player.deaths === 0 ? player.kills : Math.round((player.kills / player.deaths) * 100) / 100;
  const headshots = Math.round(player.kills * (0.22 + (index % 7) * 0.02));
  const steamId = String(76561198000001001 + index);
  return {
    steamId,
    serverId: player.serverId,
    kills: player.kills,
    deaths: player.deaths,
    kd,
    playtimeHours: player.hours,
    resourcesGathered: player.hours * (1800 + (index % 9) * 220),
    structuresBuilt: 40 + index * 7 + player.hours,
    headshots,
    scientists: Math.round(player.kills * (0.08 + (index % 5) * 0.02)),
    gambling: 12 + ((index * 17) % 88),
    raiding: Math.round(player.kills * 0.21 + index * 4),
    events: 3 + (index % 12),
    puzzles: 1 + (index % 9),
    bought: 18 + index * 11,
    looting: Math.round(player.hours * 38 + index * 14),
    lastSeenAt: new Date(Date.now() - index * 47 * 60 * 1000).toISOString(),
    source: "mock",
    name: player.name,
    avatar: avatarFor(player.name),
  };
}

export function mockLeaderboard(serverId?: string): LeaderboardEntry[] {
  const rows = PLAYERS.map(toStats).filter((row) => {
    if (serverId && row.serverId !== serverId) return false;
    return serverCatalog.some((server) => server.id === row.serverId);
  });

  rows.sort((a, b) => {
    if (b.kills !== a.kills) return b.kills - a.kills;
    return b.kd - a.kd;
  });

  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}
