"use client";

import { useEffect } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { HeaderBar } from "./HeaderBar";

export function HeaderBarWithRefresh({ user }: { user: SessionUser | null }) {
  useEffect(() => {
    if (!user) return;
    const needsRefresh = !user.avatar || /^Player \d{4}$/.test(user.name);
    if (!needsRefresh) return;
    void fetch("/api/auth/refresh", { method: "POST" });
  }, [user]);

  return <HeaderBar user={user} />;
}
