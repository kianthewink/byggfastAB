import StarRating from "@/components/reviews/StarRating";
import type { ListingReview } from "@/lib/listings/reviews";

const oneDecimal = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Average stars + review count under the product title; jumps to the reviews. */
export default function RatingSummaryLink({ reviews }: { reviews: ListingReview[] }) {
  if (reviews.length === 0) {
    return (
      <a href="#recensioner" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand">
        <StarRating rating={0} size={16} className="text-brand" />
        Inga recensioner än
      </a>
    );
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <a
      href="#recensioner"
      className="inline-flex items-center gap-2 text-sm text-ink underline-offset-2 hover:text-brand hover:underline"
    >
      <StarRating rating={average} size={16} className="text-brand" />
      <span className="font-medium">{oneDecimal.format(average)}</span>
      <span className="text-muted">
        ({reviews.length} {reviews.length === 1 ? "recension" : "recensioner"})
      </span>
    </a>
  );
}
