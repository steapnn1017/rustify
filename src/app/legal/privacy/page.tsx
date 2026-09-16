import { LegalFrame } from "@/components/legal/LegalFrame";
import { operator } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalFrame title="Privacy Policy" current="/legal/privacy">
      <p>
        Controller: {operator.legalName}, IČO {operator.ico}, {operator.address}, {operator.email}.
      </p>
      <h2>Data we process</h2>
      <ul>
        <li>
          SteamID64, persona name, avatar — Steam OpenID / Steam Web API. Legal basis: contract (account
          and entitlements) and legitimate interest (anti-abuse).
        </li>
        <li>
          Payment metadata (amount, status, provider session id) — payment processor. We do not store
          full card numbers. Legal basis: contract and legal obligation (tax).
        </li>
        <li>
          Consent logs (terms, immediate-delivery waiver, IP, time) — legal obligation and proof of
          contract.
        </li>
        <li>Optional analytics/marketing cookies — consent only.</li>
      </ul>
      <h2>Retention</h2>
      <p>
        Account and entitlement records: duration of the account plus 3 years. Invoices and tax records:
        10 years if VAT-registered. Consent logs: 3 years. Cookie consent: 12 months.
      </p>
      <h2>Your rights</h2>
      <p>
        Access, rectification, erasure, restriction, portability, and objection under GDPR. Lodge a
        complaint with the Czech Office for Personal Data Protection (ÚOOÚ). Requests: {operator.email}.
      </p>
      <h2>Processors</h2>
      <p>
        Steam (Valve), the configured payment provider (Stripe, GoPay, or Comgate), and optional
        analytics (only after consent).
      </p>
    </LegalFrame>
  );
}
