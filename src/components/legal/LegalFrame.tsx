import Link from "next/link";
import { legalNav } from "@/lib/site";

export function LegalFrame({
  title,
  current,
  children,
}: {
  title: string;
  current: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container legal-page">
      <nav className="legal-nav" aria-label="Legal">
        {legalNav.map((item) => (
          <Link key={item.href} href={item.href} aria-current={item.href === current ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      <article className="prose">
        <h1>{title}</h1>
        {children}
      </article>
    </div>
  );
}
