export const site = {
  name: "RUSTIFY.GG",
  shortName: "Rustify",
  tagline: "The official 2x vanilla modded Rust servers.",
  description:
    "EU and US Rust cluster: Main, Mondays, Monthly, and Solo / Duo / Trio. Live player counts, published wipe clocks, and Steam-linked VIP / Queue Skip.",
  url: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  discord: process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/rustify",
  steamGroup:
    process.env.NEXT_PUBLIC_STEAM_GROUP_URL ||
    "https://steamcommunity.com/groups/rustifygg",
  locale: "en-GB",
  currency: "USD",
};

export const operator = {
  legalName: process.env.OPERATOR_LEGAL_NAME || "[OPERATOR LEGAL NAME]",
  ico: process.env.OPERATOR_ICO || "[IČO]",
  dic: process.env.OPERATOR_DIC || "[DIČ]",
  address: process.env.OPERATOR_ADDRESS || "[REGISTERED ADDRESS]",
  email: process.env.OPERATOR_EMAIL || "[CONTACT EMAIL]",
  vatRegistered: process.env.OPERATOR_VAT_REGISTERED === "true",
  isPlaceholder: !process.env.OPERATOR_LEGAL_NAME,
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/servers", label: "Servers" },
  { href: "/map-voting", label: "Map Voting" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/store", label: "Store" },
  { href: "/support", label: "Support" },
] as const;

export const legalNav = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/complaints", label: "Complaints" },
  { href: "/legal/imprint", label: "Operator" },
] as const;
