import { en, type Messages } from "./en";
import { isLocale, localeMeta, type Locale } from "./languages";

export function interpolate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key]),
  );
}

export function mergeMessages(override: Partial<Messages>): Messages {
  return { ...en, ...override };
}

export function resolveLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : "en";
}

export function htmlLang(locale: Locale) {
  return localeMeta(locale).html;
}

export type { Messages };
export { en };
