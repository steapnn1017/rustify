import { getSession, type SessionUser } from "./session";
import { isPlaceholderSteamProfile, loadSteamProfile } from "./steam";

/** Load Steam persona/avatar for display. Does not write cookies (RSC-safe). */
export async function getFreshSession(): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user) return null;
  if (!isPlaceholderSteamProfile(user)) return user;
  return loadSteamProfile(user.steamId);
}
