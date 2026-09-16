import Link from "next/link";
import { legalNav, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {year} {site.name}. All rights reserved.
        </p>
        <nav aria-label="Legal">
          {legalNav.slice(0, 3).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
