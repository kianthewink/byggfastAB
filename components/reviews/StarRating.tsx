import Icon from "@/components/ui/Icon";

/**
 * Read-only star display. Supports a fractional `rating` (e.g. 4.3 for an
 * average, not just the whole 1–5 an individual review has) by overlaying a
 * row of filled stars on a row of outline stars, clipped to the matching
 * percentage width — one pair of icons handles every rating, no separate
 * "half star" asset needed.
 */
export default function StarRating({
  rating,
  size = 16,
  className = "",
}: {
  /** 0–5, fractional allowed. */
  rating: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));
  const fillPercent = (clamped / 5) * 100;

  return (
    <span
      className={`relative inline-flex ${className}`}
      role="img"
      aria-label={`${clamped.toFixed(1)} av 5 stjärnor`}
    >
      <span className="flex text-line" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon key={i} name="star" size={size} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden text-amber-400"
        style={{ width: `${fillPercent}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon key={i} name="star-filled" size={size} />
        ))}
      </span>
    </span>
  );
}
