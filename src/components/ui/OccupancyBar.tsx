export function OccupancyBar({ value }: { value: number }) {
  const width = `${Math.max(4, Math.min(100, Math.round(value * 100)))}%`;
  return (
    <div className="bar" aria-hidden="true">
      <span style={{ width }} />
    </div>
  );
}
