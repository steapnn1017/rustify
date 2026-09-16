import { LegalFrame } from "@/components/legal/LegalFrame";
import { operator } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Complaints (Reklamační řád)" };

export default function ComplaintsPage() {
  return (
    <LegalFrame title="Complaints / Reklamační řád" current="/legal/complaints">
      <p>
        File a complaint about a paid digital entitlement with {operator.legalName} at {operator.email}.
        Include SteamID64, invoice number, server name, and what failed (not granted in-game, wrong
        server, duplicate charge).
      </p>
      <h2>How we handle it</h2>
      <ul>
        <li>We confirm receipt within 2 working days.</li>
        <li>We inspect grant logs and payment status.</li>
        <li>
          If the benefit was not delivered to the purchased server, we re-queue the grant or refund the
          purchase.
        </li>
        <li>Withdrawal after immediate-delivery consent is not available except where the law still requires it.</li>
      </ul>
      <h2>Out-of-court</h2>
      <p>
        Consumers in the Czech Republic may contact the Czech Trade Inspection Authority (ČOI) and the
        EU ODR platform.
      </p>
    </LegalFrame>
  );
}
