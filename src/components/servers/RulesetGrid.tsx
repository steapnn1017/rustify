import type { Ruleset } from "@/lib/live/types";

export function RulesetGrid({ ruleset }: { ruleset: Ruleset }) {
  const cells = [
    { label: "Gather", value: ruleset.gatherRate },
    { label: "Loot", value: ruleset.lootRate },
    { label: "Stacks", value: ruleset.lootStack },
    { label: "Day/Night", value: ruleset.dayNightRatio },
    { label: "Recycler", value: ruleset.recyclerInSafeZone ? "Safe zone" : "No" },
    { label: "Team UI", value: String(ruleset.teamUiLimit) },
  ];

  return (
    <div className="rules-simple" role="list">
      {cells.map((cell) => (
        <div className="rules-simple__item" key={cell.label} role="listitem">
          <span>{cell.label}</span>
          <strong>{cell.value}</strong>
        </div>
      ))}
    </div>
  );
}
