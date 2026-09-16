import { LegalFrame } from "@/components/legal/LegalFrame";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <LegalFrame title="Cookie Policy" current="/legal/cookies">
      <p>We use cookies as described below. Analytics and marketing do not load until you consent.</p>
      <h2>Necessary</h2>
      <ul>
        <li>
          <strong>rustify_session</strong> — signed login cookie (SteamID, name). HttpOnly, SameSite=Lax,
          30 days.
        </li>
        <li>
          <strong>rustify_consent</strong> — stores your cookie choice in local storage / a consent record.
        </li>
      </ul>
      <h2>Analytics (off until allowed)</h2>
      <p>
        Plausible or equivalent first-party analytics, loaded only if you enable Analytics in the banner
        and NEXT_PUBLIC_PLAUSIBLE_DOMAIN is configured.
      </p>
      <h2>Marketing (off until allowed)</h2>
      <p>No marketing pixels ship by default. If added later, they require this category.</p>
    </LegalFrame>
  );
}
