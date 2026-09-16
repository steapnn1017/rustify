import { getFreshSession } from "@/lib/auth/refresh";
import { unreadNoticeCount } from "@/lib/support/store";
import { HeaderBarWithRefresh } from "./HeaderBarWithRefresh";
import { NotifyBridge } from "@/components/support/NotifyBridge";

export async function SiteHeader() {
  const user = await getFreshSession();
  const supportBadge = user ? unreadNoticeCount(user.steamId) : 0;
  return (
    <>
      <HeaderBarWithRefresh user={user} supportBadge={supportBadge} />
      {user ? <NotifyBridge /> : null}
    </>
  );
}
