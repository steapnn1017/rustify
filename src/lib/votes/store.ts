type Tallies = Record<string, number>;

const votes = new Map<string, Tallies>();
const ballot = new Map<string, string>();

function key(steamId: string, slug: string) {
  return `${steamId}:${slug}`;
}

export function getTally(slug: string): Tallies {
  return { ...(votes.get(slug) ?? {}) };
}

export function castVote(input: { steamId: string; slug: string; optionId: string }) {
  if (!input.optionId.startsWith(`${input.slug}-`)) {
    throw new Error("Vote option does not belong to this server");
  }
  const existing = ballot.get(key(input.steamId, input.slug));
  const tallies = { ...(votes.get(input.slug) ?? {}) };
  if (existing && tallies[existing]) {
    tallies[existing] = Math.max(0, tallies[existing] - 1);
  }
  tallies[input.optionId] = (tallies[input.optionId] ?? 0) + 1;
  votes.set(input.slug, tallies);
  ballot.set(key(input.steamId, input.slug), input.optionId);
  return tallies;
}
