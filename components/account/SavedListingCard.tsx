import Image from "next/image";
import Link from "next/link";
import SaveButton from "@/components/listings/SaveButton";
import { listingHref, type SavedListing } from "@/lib/listings/saved";
import { formatArea, formatDate, formatRent } from "@/lib/format";

/**
 * One entry in "Sparade objekt". Handles both attefallshus and attefallshus
 * med källare — the only difference is which detail route it links to.
 */
export default function SavedListingCard({ item }: { item: SavedListing }) {
  const { apartment, listingType, savedAt } = item;
  const href = listingHref(listingType, apartment.id);
  const rent = formatRent(apartment.rent);

  return (
    <article className="group relative flex gap-4 rounded-md border border-line bg-white p-4 shadow-sm transition-colors hover:border-brand-light/60 sm:gap-5 sm:p-5">
      <Link
        href={href}
        aria-label={apartment.city}
        className="absolute inset-0 z-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      />

      <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:w-40">
        <Image
          src={apartment.images[0]}
          alt=""
          fill
          sizes="(max-width: 640px) 112px, 160px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base text-brand">
              {apartment.city}
            </h3>
          </div>

          <SaveButton
            listingId={apartment.id}
            initialSaved
            authed
            size={18}
            className="relative z-20 flex size-9 shrink-0 items-center justify-center rounded-full text-brand transition-colors hover:bg-surface-3"
          />
        </div>

        <p className="mt-2 text-sm text-ink">
          {rent && <span>{rent}</span>}
          {rent && " · "}
          {formatArea(apartment)}
          {apartment.rooms != null && ` · ${apartment.rooms} rum`}
        </p>

        <p className="mt-auto pt-2 text-xs text-muted">
          Sparad {formatDate(savedAt)}
          {listingType === "attefallshus_med_kallare" && " · Med källare"}
        </p>
      </div>
    </article>
  );
}
