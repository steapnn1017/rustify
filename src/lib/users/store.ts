import { loadJson, saveJson } from "@/lib/persist";
import type { DiscordReview, NotificationPrefs } from "@/lib/support/types";

export type DiscordLink = {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  linkedAt: string;
};

export type UserProfile = {
  steamId: string;
  discord: DiscordLink | null;
  statsServerId: string;
  updatedAt: string;
  discordReview: DiscordReview | null;
  notifications: NotificationPrefs;
};

const defaultNotifications: NotificationPrefs = {
  discordDm: true,
  browser: true,
};

type Store = {
  profiles: Record<string, UserProfile>;
};

const FILE = "profiles.json";

function read(): Store {
  return loadJson<Store>(FILE, { profiles: {} });
}

function write(store: Store) {
  saveJson(FILE, store);
}

export function getUserProfile(steamId: string): UserProfile {
  const store = read();
  const existing = store.profiles[steamId];
  if (existing) {
    return {
      ...existing,
      discordReview: existing.discordReview ?? null,
      notifications: existing.notifications ?? defaultNotifications,
    };
  }
  return {
    steamId,
    discord: null,
    statsServerId: "main",
    updatedAt: new Date().toISOString(),
    discordReview: null,
    notifications: defaultNotifications,
  };
}

export function upsertUserProfile(steamId: string, patch: Partial<Omit<UserProfile, "steamId">>) {
  const store = read();
  const current = getUserProfile(steamId);
  const next: UserProfile = {
    ...current,
    ...patch,
    steamId,
    updatedAt: new Date().toISOString(),
  };
  store.profiles[steamId] = next;
  write(store);
  return next;
}

export function linkDiscord(steamId: string, discord: Omit<DiscordLink, "linkedAt">) {
  return upsertUserProfile(steamId, {
    discord: { ...discord, linkedAt: new Date().toISOString() },
  });
}

export function unlinkDiscord(steamId: string) {
  return upsertUserProfile(steamId, { discord: null });
}

export function setStatsServer(steamId: string, statsServerId: string) {
  return upsertUserProfile(steamId, { statsServerId });
}

export function setNotificationPrefs(steamId: string, notifications: Partial<NotificationPrefs>) {
  const current = getUserProfile(steamId);
  return upsertUserProfile(steamId, {
    notifications: { ...current.notifications, ...notifications },
  });
}

export function setDiscordReview(steamId: string, discordReview: DiscordReview) {
  return upsertUserProfile(steamId, { discordReview });
}
