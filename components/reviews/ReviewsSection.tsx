"use client";

import { useMemo, useState } from "react";
import StarRating from "./StarRating";
import type { ListingReview } from "@/lib/listings/reviews";

type SortOrder = "rating_desc" | "rating_asc" | "newest";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "rating_desc", label: "Högst betyg" },
  { value: "rating_asc", label: "Lägst betyg" },
  { value: "newest", label: "Nyast" },
];

const STARS = [5, 4, 3, 2, 1] as const;

const dateFormat = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/**
 * Reviews for a listing's detail page — read-only for now (see
 * lib/db/schema.ts's `reviews` table comment): visitors can browse, sort and
 * filter by star rating, but there's no "write a review" form yet.
 *
 * Takes the full, unsorted review list as a prop and does every
 * sort/filter/summary computation client-side. A listing's reviews are few
 * enough that re-deriving them from one fetched array beats round-tripping
 * to the database on every sort or filter change.
 */
export default function ReviewsSection({
  reviews,
}: {
  reviews: ListingReview[];
}) {
  const [sort, setSort] = useState<SortOrder>("rating_desc");
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const summary = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    for (const r of reviews) {
      total += r.rating;
      counts[r.rating] = (counts[r.rating] ?? 0) + 1;
    }
    return {
      average: reviews.length > 0 ? total / reviews.length : 0,
      count: reviews.length,
      counts,
    };
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const filtered =
      starFilter === null ? reviews : reviews.filter((r) => r.rating === starFilter);

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "rating_desc") return b.rating - a.rating;
      if (sort === "rating_asc") return a.rating - b.rating;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return sorted;
  }, [reviews, sort, starFilter]);

  if (reviews.length === 0) {
    return (
      <section id="recensioner" className="mt-10 scroll-mt-24 border-t border-line pt-8">
        <h2 className="text-lg text-brand">Recensioner</h2>
        <p className="mt-2 text-sm text-muted">
          Inga recensioner än för det här objektet.
        </p>
      </section>
    );
  }

  return (
    <section id="recensioner" className="mt-10 scroll-mt-24 border-t border-line pt-8">
      <h2 className="text-lg text-brand">Recensioner</h2>

      <div className="mt-4 grid gap-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        {/* Summary + star breakdown */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-ink">
              {summary.average.toFixed(1)}
            </span>
            <span className="text-sm text-muted">av 5</span>
          </div>
          <StarRating rating={summary.average} size={18} className="mt-1" />
          <p className="mt-1 text-sm text-muted">
            {summary.count} {summary.count === 1 ? "recension" : "recensioner"}
          </p>

          <div className="mt-4 space-y-1.5">
            {STARS.map((star) => {
              const count = summary.counts[star] ?? 0;
              const percent =
                summary.count > 0 ? (count / summary.count) * 100 : 0;
              const isActive = starFilter === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setStarFilter((current) => (current === star ? null : star))
                  }
                  disabled={count === 0}
                  aria-pressed={isActive}
                  className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    isActive ? "bg-surface-3" : "hover:bg-surface-3"
                  }`}
                >
                  <span className="w-10 shrink-0 text-muted">{star} stj.</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full bg-amber-400"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right text-muted">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {starFilter !== null && (
            <button
              type="button"
              onClick={() => setStarFilter(null)}
              className="mt-3 text-xs text-brand underline-offset-2 hover:underline"
            >
              Rensa filter ({starFilter} stjärnor)
            </button>
          )}
        </div>

        {/* Sort + review list */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Visar {visibleReviews.length} av {summary.count}
            </p>
            <label className="flex items-center gap-2 text-sm text-ink">
              Sortera:
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                className="rounded-md border border-line bg-white px-2 py-1 text-sm outline-none focus:border-brand"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ul className="mt-4 space-y-5">
            {visibleReviews.map((review) => (
              <li key={review.id} className="border-b border-line pb-5">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size={15} />
                  {review.title && (
                    <p className="text-sm font-semibold text-ink">
                      {review.title}
                    </p>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {review.authorName} · {dateFormat.format(review.createdAt)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {review.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
