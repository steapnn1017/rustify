"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Headphones,
  Menu,
  MessageCircle,
  Server,
  ShoppingBag,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { nav, site } from "@/lib/site";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

const icons = {
  servers: Server,
  store: ShoppingBag,
  leaderboard: Trophy,
  support: Headphones,
  discord: MessageCircle,
} as const;

const LANG_KEY = "rustify_lang";

const languages = [
  { id: "en", label: "English", flag: "/flags/gb.svg" },
  { id: "cs", label: "Čeština", flag: "/flags/cz.svg" },
] as const;

type LangId = (typeof languages)[number]["id"];

export function HeaderBar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link className="brand" href="/">
          <span className="brand__mark" aria-hidden="true">
            R
          </span>
          <span className="brand__text">{site.shortName}</span>
        </Link>

        <nav className="topbar__nav" aria-label="Primary">
          {nav.map((item) => {
            const Icon = icons[item.icon];
            const external = "external" in item && item.external;
            const active = !external && isCurrent(item.href);
            const className = active ? "topbar__link is-active" : "topbar__link";
            if (external) {
              return (
                <a key={item.href} className="topbar__link" href={item.href} rel="noreferrer" target="_blank">
                  <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={item.href}
                className={className}
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="topbar__end">
          <Dropdown
            label="Language"
            className="lang-dd"
            align="right"
            buttonClassName="lang-btn"
            valueLabel={currentLang.label}
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentLang.flag} alt="" width={18} height={12} />
            }
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
              buttonClassName="user-chip"
              valueLabel={user.name}
              icon={
                user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="" width={28} height={28} />
                ) : (
                  <span className="user-chip__fallback" aria-hidden="true" />
                )
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
            <a className="steam-btn" href={loginHref}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 0 0-10 9.3l5.4 2.2a2.7 2.7 0 0 1 2.7-1.4l3.8-5.5a3.4 3.4 0 1 1 2.7 1.6l-3.7 5.4c.4.2.8.6 1 1.1l5.9-2.4A10 10 0 0 0 12 2Zm-1.4 13.1-2.2-.9a2.7 2.7 0 1 0 2.5 4.4 2.7 2.7 0 0 0-.3-3.5Zm6.2-8.4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z"
                />
              </svg>
              <span className="steam-btn__text">Sign in with Steam</span>
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
          {nav.map((item) =>
            "external" in item && item.external ? (
              <a key={item.href} href={item.href} rel="noreferrer" target="_blank">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ),
          )}
          <div className="topbar__drawer-langs">
            {languages.map((item) => (
              <button
                key={item.id}
                type="button"
                className={lang === item.id ? "chip is-active" : "chip"}
                onClick={() => {
                  chooseLang(item.id);
                  setOpen(false);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="flag" src={item.flag} alt="" width={16} height={11} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
