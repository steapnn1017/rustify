import { NextResponse } from "next/server";
import { getPurchaseByInvoice } from "@/lib/commerce/orders";
import { operator, site } from "@/lib/site";
import { formatUsd } from "@/lib/format";
import { getTier } from "@/lib/store/catalog";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = getPurchaseByInvoice(id);
  if (!purchase) return new NextResponse("Invoice not found", { status: 404 });
  const tier = getTier(purchase.tier);
  const vat = operator.vatRegistered;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${purchase.invoiceId}</title>
  <style>
    body { font-family: ui-sans-serif, sans-serif; background: #06090D; color: #E4EEF4; padding: 48px; }
    .sheet { max-width: 720px; margin: 0 auto; border: 1px solid #2C3E4C; padding: 32px; background: #0C1218; }
    h1 { font-size: 28px; letter-spacing: 0.08em; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    td, th { border-bottom: 1px solid #2C3E4C; padding: 8px 0; text-align: left; }
    .muted { color: #9AADC0; }
    .flag { color: #2EE6EA; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="sheet">
    <p class="flag">${site.name} invoice</p>
    <h1>${purchase.invoiceId}</h1>
    <p class="muted">${operator.legalName} · IČO ${operator.ico} · ${operator.address}<br/>${operator.email}${vat ? ` · DIČ ${operator.dic}` : ""}</p>
    <p>Bill to SteamID64 ${purchase.steamId}${purchase.giftSteamId ? `<br/>Gift to SteamID64 ${purchase.giftSteamId}` : ""}</p>
    <table>
      <tr><th>Item</th><th>Server</th><th>Amount</th></tr>
      <tr>
        <td>${tier?.name ?? purchase.tier} · ${tier?.durationDays ?? 30} days digital content</td>
        <td>${purchase.serverName}</td>
        <td>${formatUsd(purchase.amountCents)}</td>
      </tr>
    </table>
    <p>${vat ? "VAT: include the applicable Czech VAT rate on this line when the operator is VAT-registered." : "VAT not applied (operator VAT flag is off)."}</p>
    <p>Paid: ${purchase.paidAt ?? "pending"} · Status: ${purchase.status}</p>
    <p class="muted">Immediate performance of digital content was requested at checkout (Civil Code § 1837).</p>
  </div>
</body>
</html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
