import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff review",
};

export default async function ReviewDonePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; v?: string }>;
}) {
  const { ok, v } = await searchParams;
  const good = ok === "1";
  return (
    <section className="support">
      <div className="container support__inner">
        <h1>{good ? (v === "reject" ? "Rejected" : "Accepted") : "Invalid link"}</h1>
        <p>
          {good
            ? v === "reject"
              ? "This Discord / Steam pair was rejected. The player was notified."
              : "This Discord / Steam pair was accepted. Whitelist can be applied on that account."
            : "This review link is invalid or expired."}
        </p>
        <Link className="btn btn-primary" href="/support">
          Back to support
        </Link>
      </div>
    </section>
  );
}
