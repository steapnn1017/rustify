export function formatPlayers(current: number, max: number) {
  return `${current}/${max}`;
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatEur(cents: number) {
  return formatUsd(cents);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(new Date(iso));
}

export function remainingParts(targetIso: string, now = Date.now()) {
  const ms = Math.max(0, new Date(targetIso).getTime() - now);
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { ms, days, hours, minutes, seconds };
}

export function formatRemaining(targetIso: string, now = Date.now(), wipingNow = "Wiping now") {
  const { ms, days, hours, minutes, seconds } = remainingParts(targetIso, now);
  if (ms <= 0) return wipingNow;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function steamConnectUri(host: string, port: number) {
  return `steam://connect/${host}:${port}`;
}

export function connectString(host: string, port: number) {
  return `${host}:${port}`;
}

export function relativeQuery(iso: string, now = Date.now()) {
  const delta = Math.max(0, now - new Date(iso).getTime());
  const seconds = Math.round(delta / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

export function formatRelative(iso: string, now = Date.now()) {
  const delta = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}
