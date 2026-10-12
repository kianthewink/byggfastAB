import Icon from "@/components/ui/Icon";
import type { Apartment } from "@/lib/types";

const decimal = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 });

/**
 * "40 m² + 9,87 m² loft · 10,83 × 3,69 × 4,15 m · 2 sovrum" — the key
 * measurements, shown right under the product title. Parts with no data are
 * simply left out.
 */
export default function ProductSpecsLine({ listing }: { listing: Apartment }) {
  const { length, width, height, loftArea, bedrooms } = listing;
  const hasDimensions = length != null && width != null && height != null;

  return (
    <ul className="flex flex-wrap items-center gap-x-7 gap-y-3 text-base text-ink">
      <li className="flex items-center gap-2.5">
        <Icon name="home" size={21} className="shrink-0 text-brand" />
        <span>
          {decimal.format(listing.area)} m²
          {loftArea != null && ` + ${decimal.format(loftArea)} m² loft`}
        </span>
      </li>
      {hasDimensions && (
        <li className="flex items-center gap-2.5">
          <Icon name="ruler" size={21} className="shrink-0 text-brand" />
          <span>
            <span className="sr-only">Längd × bredd × höjd: </span>
            {decimal.format(length)} × {decimal.format(width)} ×{" "}
            {decimal.format(height)} m
          </span>
        </li>
      )}
      {bedrooms != null && (
        <li className="flex items-center gap-2.5">
          <Icon name="bed" size={21} className="shrink-0 text-brand" />
          <span>
            {bedrooms} <span className="sr-only">sovrum</span>
          </span>
        </li>
      )}
    </ul>
  );
}
