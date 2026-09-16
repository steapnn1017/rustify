"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { nav } from "@/lib/site";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

const LANG_KEY = "rustify_lang";

const languages = [
  { id: "en", label: "English", short: "EN", flag: "/flags/gb.svg" },
  { id: "cs", label: "Čeština", short: "CS", flag: "/flags/cz.svg" },
] as const;

type LangId = (typeof languages)[number]["id"];

export function HeaderBar({ user, supportBadge = 0 }: { user: SessionUser | null; supportBadge?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const [lang, setLang] = useState<LangId>("en");
  const loginHref = `/api/auth/steam?returnTo=${encodeURIComponent(pathname || "/")}`;
  const currentLang = languages.find((item) => item.id === lang) ?? languages[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as LangId | null;
      if (saved === "en" || saved === "cs") setLang(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    function syncHash() {
      setHash(window.location.hash);
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  function chooseLang(next: LangId) {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next === "cs" ? "cs" : "en";
  }

  function isCurrent(href: string) {
    if (href === "/#servers") return pathname === "/" && hash === "#servers";
    if (href === "/") return pathname === "/" && hash !== "#servers";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link className="brand" href="/" aria-label="Rustify">
          <span className="brand__mark" aria-hidden="true">
            R
          </span>
          <span className="brand__text">
            Rust<span>ify</span>
          </span>
        </Link>

        <nav className="topbar__nav" aria-label="Primary">
          {nav.map((item) => {
            const active = isCurrent(item.href);
            return (
              <Link
                key={item.href}
                className={active ? "topbar__link is-active" : "topbar__link"}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  if (item.href.includes("#")) setHash("#servers");
                  else setHash("");
                  setOpen(false);
                }}
              >
                {item.label}
                {item.href === "/support" && supportBadge > 0 ? (
                  <i className="nav-dot" aria-label={`${supportBadge} unread`} />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="topbar__end">
          <Dropdown
            label="Language"
            className="lang-dd"
            align="right"
            buttonClassName="topbar__tool"
            valueLabel={currentLang.short}
            icon={<Globe size={15} strokeWidth={1.7} aria-hidden="true" />}
          >
            {(close) =>
              languages.map((item) => (
                <DropdownItem
                  key={item.id}
                  active={lang === item.id}
                  onSelect={() => {
                    chooseLang(item.id);
                    close();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="flag" src={item.flag} alt="" width={18} height={12} />
                  {item.label}
                </DropdownItem>
              ))
            }
          </Dropdown>

          {user ? (
            <Dropdown
              label="Account"
              className="user-dd"
              align="right"
              buttonClassName="topbar__tool"
              valueLabel="Account"
              icon={
                user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="topbar__avatar" src={user.avatar} alt="" width={18} height={18} />
                ) : null
              }
            >
              {(close) => (
                <>
                  <Link className="dd__item" href="/account" onClick={close} role="menuitem">
                    Account
                  </Link>
                  <Link className="dd__item" href="/store" onClick={close} role="menuitem">
                    Purchases
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button className="dd__item" type="submit" role="menuitem">
                      Sign out
                    </button>
                  </form>
                </>
              )}
            </Dropdown>
          ) : (
            <a className="topbar__tool" href={loginHref}>
              Account
            </a>
          )}

          <button
            className="menu-btn"
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="topbar__drawer" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.href.includes("#")) setHash("#servers");
                else setHash("");
                setOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
