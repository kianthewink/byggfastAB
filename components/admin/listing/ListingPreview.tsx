import type { Listing } from "@/lib/db/schema";
import { listingTypeLabel } from "./format";
import { ListingBackendPreview } from "./ListingBackendPreview";
import { ListingFrontendPreview } from "./ListingFrontendPreview";

/**
 * Shows both views at once: how the listing renders on the public site (the
 * same card design for both attefallshus and attefallshus med källare) and
 * how it slots into this admin panel. Shared by the Create page and the
 * Import row preview.
 */
export function ListingPreview({
  listing,
  className = "",
}: {
  listing: Listing;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-3 text-sm font-semibold">Förhandsvisning</h3>

      <div className="flex flex-col gap-5">
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-panel-muted">
            Webbplatsen &mdash; så här ser den ut publikt (
            {listingTypeLabel(listing.listingType).toLowerCase()})
          </p>
          <ListingFrontendPreview listing={listing} />
        </section>

        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-panel-muted">
            Adminpanelen &mdash; rad i innehållslistan
          </p>
          <ListingBackendPreview listing={listing} />
        </section>
      </div>
    </div>
  );
}
