"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Messages } from "./en";
import { htmlLang, interpolate, mergeMessages, resolveLocale } from "./index";
import { LANG_KEY, languages, localeMeta, type Locale } from "./languages";
import { packs } from "./packs";

type I18nValue = {
  locale: Locale;
  t: (key: keyof Messages, vars?: Record<string, string | number>) => string;
  setLocale: (next: Locale) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      setLocaleState(resolveLocale(localStorage.getItem(LANG_KEY)));
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = htmlLang(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale);
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const messages = useMemo(() => mergeMessages(packs[locale] ?? {}), [locale]);

  const t = useCallback(
    (key: keyof Messages, vars?: Record<string, string | number>) => interpolate(messages[key] || en[key], vars),
    [messages],
  );

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export { languages, localeMeta, LANG_KEY };
export type { Locale };
