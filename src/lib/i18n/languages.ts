export const languages = [
  { id: "en", label: "English", short: "EN", flag: "gb", html: "en" },
  { id: "fr", label: "Français", short: "FR", flag: "fr", html: "fr" },
  { id: "de", label: "Deutsch", short: "DE", flag: "de", html: "de" },
  { id: "es", label: "Español", short: "ES", flag: "es", html: "es" },
  { id: "ru", label: "Русский", short: "RU", flag: "ru", html: "ru" },
  { id: "tr", label: "Türkçe", short: "TR", flag: "tr", html: "tr" },
  { id: "zh", label: "中文", short: "ZH", flag: "cn", html: "zh" },
  { id: "it", label: "Italiano", short: "IT", flag: "it", html: "it" },
  { id: "pl", label: "Polski", short: "PL", flag: "pl", html: "pl" },
  { id: "uk", label: "Українська", short: "UK", flag: "ua", html: "uk" },
  { id: "nl", label: "Nederlands", short: "NL", flag: "nl", html: "nl" },
  { id: "el", label: "Ελληνικά", short: "EL", flag: "gr", html: "el" },
  { id: "ro", label: "Română", short: "RO", flag: "ro", html: "ro" },
  { id: "sv", label: "Svenska", short: "SV", flag: "se", html: "sv" },
  { id: "no", label: "Norsk", short: "NO", flag: "no", html: "no" },
  { id: "da", label: "Dansk", short: "DA", flag: "dk", html: "da" },
  { id: "fi", label: "Suomi", short: "FI", flag: "fi", html: "fi" },
  { id: "hu", label: "Magyar", short: "HU", flag: "hu", html: "hu" },
  { id: "sk", label: "Slovenčina", short: "SK", flag: "sk", html: "sk" },
  { id: "cs", label: "Čeština", short: "CS", flag: "cz", html: "cs" },
  { id: "bg", label: "Български", short: "BG", flag: "bg", html: "bg" },
  { id: "es-MX", label: "Español (México)", short: "MX", flag: "mx", html: "es" },
  { id: "hr", label: "Hrvatski", short: "HR", flag: "hr", html: "hr" },
  { id: "lt", label: "Lietuvių", short: "LT", flag: "lt", html: "lt" },
  { id: "lv", label: "Latviešu", short: "LV", flag: "lv", html: "lv" },
  { id: "et", label: "Eesti", short: "ET", flag: "ee", html: "et" },
  { id: "ja", label: "日本語", short: "JA", flag: "jp", html: "ja" },
] as const;

export type Locale = (typeof languages)[number]["id"];

export const LANG_KEY = "rustify_lang";

export function flagUrl(code: string) {
  return `https://flagcdn.com/w40/${code}.png`;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && languages.some((item) => item.id === value));
}

export function localeMeta(id: Locale) {
  return languages.find((item) => item.id === id) ?? languages[0];
}
