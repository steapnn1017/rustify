import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotifySettings } from "@/components/support/NotifySettings";
import { getFreshSession } from "@/lib/auth/refresh";
import { getUserProfile } from "@/lib/users/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notification settings",
};

export default async function SupportSettingsPage() {
  const user = await getFreshSession();
  if (!user) redirect("/api/auth/steam?returnTo=/support/settings");
  const profile = getUserProfile(user.steamId);
  return <NotifySettings prefs={profile.notifications} discord={profile.discord} />;
}
