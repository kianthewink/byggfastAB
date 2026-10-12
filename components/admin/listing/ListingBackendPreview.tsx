import { ChevronDownIcon, ImagePlaceholderIcon } from "@/components/admin/icons";
import type { Listing } from "@/lib/db/schema";
import { currency, formatArea, listingTypeLabel } from "./format";

/**
 * Mirrors the collapsed row a listing gets on the Content page, so you can
 * see how it will slot into the admin list before saving.
 */
export function ListingBackendPreview({ listing }: { listing: Listing }) {
  return (
    <div className="rounded-xl border border-border bg-panel text-panel-foreground">
      <div className="flex w-full items-center gap-4 p-4 text-left">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-card">
          {listing.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-panel-muted">
              <ImagePlaceholderIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">
              {listing.city || "Ort saknas"}
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                listing.listingType === "attefallshus"
                  ? "bg-accent text-accent-foreground"
                  : "bg-sidebar text-sidebar-foreground"
              }`}
            >
              {listingTypeLabel(listing.listingType)}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-panel-muted">
            {listing.rooms} rum &middot; {formatArea(listing)} &middot;{" "}
            {currency.format(listing.rent)} kr/m&aring;n
          </p>
        </div>

        <ChevronDownIcon className="h-4 w-4 shrink-0 text-panel-muted" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border p-4 text-xs sm:grid-cols-4">
        <Row label="Id" value={listing.id || "—"} mono />
        <Row label="Bilder" value={String(listing.images.length)} />
        <Row label="Bekvämligheter" value={String(listing.amenities.length)} />
        <Row label="Visningar" value={String(listing.viewings.length)} />
        <Row label="Inflyttning" value={listing.available ?? "—"} />
        <Row label="Källa" value={listing.sourceCollection ?? "—"} />
        <Row label="Kontakter" value={listing.contacts ?? "—"} />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-panel-muted">
        {label}
      </p>
      <p className={`truncate ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
