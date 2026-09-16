/** Wipe clocks derived from published schedules, not hardcoded calendar dates. */

function atUtc(date: Date, hour = 16, minute = 0) {
  const next = new Date(date);
  next.setUTCHours(hour, minute, 0, 0);
  return next;
}

export function nextWeekday(weekday: number, hourUtc = 16, from = new Date()) {
  const date = atUtc(from, hourUtc);
  const delta = (weekday - date.getUTCDay() + 7) % 7;
  if (delta === 0 && from.getTime() >= date.getTime()) {
    date.setUTCDate(date.getUTCDate() + 7);
  } else {
    date.setUTCDate(date.getUTCDate() + delta);
  }
  return date;
}

export function nextMonthlyWipe(weekday: number, hourUtc = 16, from = new Date()) {
  const year = from.getUTCFullYear();
  const month = from.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1, hourUtc, 0, 0, 0));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  first.setUTCDate(1 + offset);
  if (from.getTime() >= first.getTime()) {
    const nextMonth = new Date(Date.UTC(year, month + 1, 1, hourUtc, 0, 0, 0));
    const nextOffset = (weekday - nextMonth.getUTCDay() + 7) % 7;
    nextMonth.setUTCDate(1 + nextOffset);
    return nextMonth;
  }
  return first;
}

export function nextBpWipe(from = new Date()) {
  return nextMonthlyWipe(4, 16, from);
}
