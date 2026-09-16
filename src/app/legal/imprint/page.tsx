import { LegalFrame } from "@/components/legal/LegalFrame";
import { operator } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Operator" };

export default function ImprintPage() {
  return (
    <LegalFrame title="Operator / legal identity" current="/legal/imprint">
      <p>
        Fill these values via environment variables before taking the store live.
        {operator.isPlaceholder ? <span className="placeholder-flag">Placeholder</span> : null}
      </p>
      <ul>
        <li>Legal name: {operator.legalName}</li>
        <li>IČO (registration ID): {operator.ico}</li>
        <li>DIČ / VAT ID: {operator.dic}</li>
        <li>Registered address: {operator.address}</li>
        <li>Contact email: {operator.email}</li>
        <li>VAT-registered: {operator.vatRegistered ? "Yes — invoices include VAT lines" : "No / not set"}</li>
      </ul>
    </LegalFrame>
  );
}
