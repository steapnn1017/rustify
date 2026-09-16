import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TicketForm } from "@/components/support/TicketForm";
import { getFreshSession } from "@/lib/auth/refresh";
import { categoryById } from "@/lib/support/catalog";
import { getUserProfile } from "@/lib/users/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New ticket",
};

export default async function NewTicketPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const category = categoryById(type);
  if (!category) redirect("/support");
  const user = await getFreshSession();
  if (category.requiresDiscord) {
    if (!user) redirect(`/api/auth/steam?returnTo=/support/new/${category.id}`);
    const profile = getUserProfile(user.steamId);
    if (!profile.discord) redirect(`/api/auth/discord?returnTo=/support/new/${category.id}`);
  }
  return <TicketForm type={category.id} playerName={user?.name || ""} signedIn={Boolean(user)} />;
}
