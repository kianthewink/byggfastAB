import Image from "next/image";
import Button from "@/components/ui/Button";
import SaveButton from "@/components/listings/SaveButton";
import CompareToggle from "@/components/compare/CompareToggle";
import type { Apartment } from "@/lib/types";
import { formatArea, formatRent } from "@/lib/format";

/**
 * Listing card shared by both /attefallshus and /attefallshus-med-kallare —
 * the two categories look identical in a grid; only which page links to
 * which detail route differs.
 */
export default function ApartmentCard({
  apartment,
  href,
  typeLabel,
  saved = false,
  authed = false,
  priority = false,
}: {
  apartment: Apartment;
  /** Detail page to link to — differs between the two listing categories. */
  href: string;
  /** "Attefallshus" / "Attefallshus med källare" — names it in the compare bar. */
  typeLabel: string;
  /** Whether the signed-in visitor has hearted this listing. */
  saved?: boolean;
  authed?: boolean;
  /** Set for the first card in a grid — it's the page's LCP image. */
  priority?: boolean;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-line bg-white shadow-sm">
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <Image
          src={apartment.images[0]}
          alt={apartment.city}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority}
          className="object-cover"
        />
        <SaveButton
          listingId={apartment.id}
          initialSaved={saved}
          authed={authed}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm transition-colors hover:bg-white"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg text-brand">{apartment.city}</h3>

        <dl className="mt-3 grid grid-cols-3 gap-2 text-sm text-ink">
          <div>
            <dt className="text-xs text-muted label-caps">Rum</dt>
            <dd>{apartment.rooms}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted label-caps">Yta</dt>
            <dd>{formatArea(apartment)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted label-caps">Hyra</dt>
            <dd>{formatRent(apartment.rent) ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          Inflyttning: {apartment.available}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <CompareToggle
            item={{
              id: apartment.id,
              title: `${typeLabel} i ${apartment.city}`,
              image: apartment.images[0],
            }}
          />
          <Button href={href}>Läs mer...</Button>
        </div>
      </div>
    </article>
  );
}
