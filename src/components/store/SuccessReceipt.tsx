"use client";

import Link from "next/link";
import { CheckCircle2, FileText, Gamepad2 } from "lucide-react";
import type { Purchase } from "@/lib/commerce/orders";
import { formatUsd } from "@/lib/format";
import { useT } from "@/lib/i18n/I18nProvider";

export function SuccessReceipt({
  paid,
  purchase,
  productName,
  durationDays,
  verifyError,
}: {
  paid: boolean;
  purchase: Purchase | null;
  productName: string | null;
  durationDays: number;
  verifyError: string | null;
}) {
  const t = useT();
  return (
    <section className="checkout-page">
      <div className="container receipt">
        <div className={paid ? "receipt__icon is-ok" : "receipt__icon"}>
          <CheckCircle2 size={28} strokeWidth={1.6} />
        </div>
        <p className="kicker">{paid ? t("successReceipt") : t("successConfirming")}</p>
        <h1>{paid ? t("successComplete") : t("successConfirmingTitle")}</h1>
        <p className="receipt__lead">{paid ? t("successThanks") : t("successWait")}</p>

        {purchase ? (
          <dl className="receipt__sheet">
            <div>
              <dt>{t("invoice")}</dt>
              <dd className="mono">{purchase.invoiceId}</dd>
            </div>
            <div>
              <dt>{t("product")}</dt>
              <dd>{productName ?? purchase.tier}</dd>
            </div>
            <div>
              <dt>{t("applies")}</dt>
              <dd>{purchase.serverName}</dd>
            </div>
            <div>
              <dt>Steam</dt>
              <dd className="mono">
                {purchase.giftSteamId ? t("giftTo", { id: purchase.giftSteamId }) : purchase.steamId}
              </dd>
            </div>
            {purchase.giftSteamId ? (
              <div>
                <dt>{t("paidByLabel")}</dt>
                <dd className="mono">{purchase.steamId}</dd>
              </div>
            ) : null}
            {purchase.couponCode ? (
              <div>
                <dt>{t("coupon")}</dt>
                <dd>{purchase.couponCode}</dd>
              </div>
            ) : null}
            <div>
              <dt>{t("amount")}</dt>
              <dd>{formatUsd(purchase.amountCents)}</dd>
            </div>
            <div>
              <dt>{t("status")}</dt>
              <dd>{paid ? t("paid") : purchase.status}</dd>
            </div>
            <div>
              <dt>{t("duration")}</dt>
              <dd>{t("days", { n: durationDays })}</dd>
            </div>
          </dl>
        ) : (
          <p className="alert">{t("successMissing")}</p>
        )}

        {verifyError ? (
          <p className="alert alert--error" role="alert">
            {verifyError}
          </p>
        ) : null}

        {paid ? (
          <ol className="receipt__next">
            <li>
              <b>1</b>
              <span>{t("next1")}</span>
            </li>
            <li>
              <b>2</b>
              <span>{t("next2")}</span>
            </li>
            <li>
              <b>3</b>
              <span>{t("next3")}</span>
            </li>
          </ol>
        ) : null}

        <div className="receipt__actions">
          {purchase ? (
            <a className="btn btn-ghost" href={`/api/invoices/${purchase.invoiceId}`}>
              <FileText size={15} strokeWidth={1.75} />
              {t("downloadInvoice")}
            </a>
          ) : null}
          <Link className="btn btn-primary" href="/account">
            {t("viewAccount")}
          </Link>
          <Link className="btn btn-ghost" href="/servers">
            <Gamepad2 size={15} strokeWidth={1.75} />
            {t("goServers")}
          </Link>
        </div>
      </div>
    </section>
  );
}
