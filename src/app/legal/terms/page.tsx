import { LegalFrame } from "@/components/legal/LegalFrame";
import { operator, site } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions (VOP)" };

export default function TermsPage() {
  return (
    <LegalFrame title="Terms & Conditions (VOP)" current="/legal/terms">
      <p>
        These terms govern the sale of virtual in-game benefits (Queue Skip, VIP, Pro) on {site.name} by{" "}
        {operator.legalName} ({operator.ico}).
      </p>
      <h2>Digital content</h2>
      <p>
        Goods sold are digital content and in-game services performed on a named game server. They are not
        physical goods and they do not alter gather, loot, or stack multipliers beyond the public ruleset.
      </p>
      <h2>Right of withdrawal</h2>
      <p>
        Under Directive 2011/83/EU and Czech Civil Code § 1837, the consumer loses the statutory 14-day
        withdrawal right for digital content if they request immediate performance and acknowledge that
        they lose that right. Checkout requires a separate, unticked checkbox for that consent. We log
        SteamID64, timestamp, IP address, and both checkbox states with the order.
      </p>
      <h2>Delivery</h2>
      <p>
        After confirmed payment the entitlement is written to our store and a grant command is queued for
        the Oxide/Carbon plugin (or RCON) on the selected server. Validity is 30 days unless stated
        otherwise on the offer.
      </p>
      <h2>Fair use</h2>
      <p>
        Chargeback fraud, payment abuse, or ban evasion using a paid entitlement may result in removal of
        the benefit without refund where permitted by law.
      </p>
      <h2>Contact</h2>
      <p>
        {operator.legalName}, {operator.address}, {operator.email}
      </p>
    </LegalFrame>
  );
}
