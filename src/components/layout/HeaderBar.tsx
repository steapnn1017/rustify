"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth/session";
import { nav } from "@/lib/site";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { flagUrl, languages, type Locale } from "@/lib/i18n/languages";
import { useI18n } from "@/lib/i18n/I18nProvider";

const navKeys = {
  "/": "navHome",
  "/servers": "navServers",
  "/map-voting": "navMapVoting",
  "/leaderboard": "navLeaderboard",
  "/store": "navStore",
  "/support": "navSupport",
} as const;

export function HeaderBar({ user, supportBadge = 0 }: { user: SessionUser | null; supportBadge?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const loginHref = `/api/auth/steam?returnTo=${encodeURIComponent(pathname || "/")}`;
  const currentLang = languages.find((item) => item.id === locale) ?? languages[0];

  function isCurrent(href: string) {
    if (href === "/") return pathname === "/";
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
            const key = navKeys[item.href];
            return (
              <Link
                key={item.href}
                className={active ? "topbar__link is-active" : "topbar__link"}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {t(key)}
                {item.href === "/support" && supportBadge > 0 ? (
                  <i className="nav-dot" aria-label={`${supportBadge} ${t("unread")}`} />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="topbar__end">
          <Dropdown
            label={t("language")}
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
                  active={locale === item.id}
                  onSelect={() => {
                    setLocale(item.id as Locale);
                    close();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="flag" src={flagUrl(item.flag)} alt="" width={18} height={12} />
                  {item.label}
                </DropdownItem>
              ))
            }
          </Dropdown>

          {user ? (
            <Dropdown
              label={t("account")}
              className="user-dd"
              align="right"
              buttonClassName="topbar__tool"
              valueLabel={t("account")}
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
                    {t("account")}
                  </Link>
                  <Link className="dd__item" href="/store" onClick={close} role="menuitem">
                    {t("purchases")}
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button className="dd__item" type="submit" role="menuitem">
                      {t("signOut")}
                    </button>
                  </form>
                </>
              )}
            </Dropdown>
          ) : (
            <a className="topbar__tool" href={loginHref}>
              {t("account")}
            </a>
          )}

          <button
            className="menu-btn"
            type="button"
            aria-expanded={open}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="topbar__drawer" aria-label="Mobile">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {t(navKeys[item.href])}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
