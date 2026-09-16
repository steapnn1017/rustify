import { getFreshSession } from "@/lib/auth/refresh";
import { HeaderBarWithRefresh } from "./HeaderBarWithRefresh";

export async function SiteHeader() {
  const user = await getFreshSession();
  return <HeaderBarWithRefresh user={user} />;
}
