import { ImagePlaceholderIcon } from "@/components/admin/icons";
import type { Listing } from "@/lib/db/schema";
import { currency } from "./format";

/**
 * Approximates the public site's listing card. Attefallshus and attefallshus
 * med källare share the exact same compact portrait card design — the only
 * difference between the two is which page they're listed on.
 * Colours are fixed rather than themed — this previews another site, so it
 * shouldn't follow the admin panel's dark mode.
 */

const BRAND = "#22548F";
const MUTED = "#7C8B7C";

function EmptyImage({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400 ${className}`}
    >
      <ImagePlaceholderIcon className="h-8 w-8" />
      <span className="font-mono text-xs">Inga bilder ännu</span>
    </div>
  );
}

function areaLabel(listing: Listing) {
  return listing.areaMax
    ? `${listing.area}–${listing.areaMax} m²`
    : `${listing.area} m²`;
}

export function ListingFrontendPreview({ listing }: { listing: Listing }) {
  const hero = listing.images[0];

  return (
    <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white font-mono shadow-sm">
      {hero ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero} alt="" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <EmptyImage className="aspect-[4/3] w-full" />
      )}

      <div className="p-5">
        <h3 className="text-xl leading-tight" style={{ color: BRAND }}>
          {listing.city || "Ort saknas"}
        </h3>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "RUM", value: String(listing.rooms) },
            { label: "YTA", value: areaLabel(listing) },
            {
              label: "HYRA",
              value: `${currency.format(listing.rent)} kr/mån`,
            },
          ].map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] tracking-wider" style={{ color: MUTED }}>
                {f.label}
              </dt>
              <dd className="mt-0.5 text-sm text-slate-800">{f.value}</dd>
            </div>
          ))}
        </dl>

        {listing.available && (
          <p className="mt-5 text-xs" style={{ color: MUTED }}>
            Inflyttning: {listing.available}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <span
            className="rounded-lg px-4 py-2 text-sm text-slate-700"
            style={{ backgroundColor: "#DBE1F1" }}
          >
            Läs mer...
          </span>
        </div>
      </div>
    </div>
  );
}
