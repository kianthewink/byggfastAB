"use client";

import ApplyButton from "@/components/listings/ApplyButton";
import Icon from "@/components/ui/Icon";
import { formatKr } from "@/lib/build/pricing";
import { useBuild } from "./BuildProvider";
import KommunSelect from "./KommunSelect";
import PackageOptions from "./PackageOptions";

/**
 * The buy box beside the product details: kommun, package, the running
 * total (package + any Bygg online choices) and the two calls to action.
 */
export default function PurchaseBox({
  initialApplied,
  authed,
}: {
  initialApplied: boolean;
  authed: boolean;
}) {
  const build = useBuild();
  if (!build) return null;

  const { quote, municipality, listingId } = build;

  // No purchase options entered for this product yet: interest can still be
  // registered, just without a package or price.
  if (build.packages.length === 0) {
    return (
      <div className="rounded-md border border-line bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm text-ink">
          Priser för det här huset kommer snart. Anmäl ditt intresse så hör vi
          av oss.
        </p>
        <ApplyButton
          listingId={listingId}
          initialApplied={initialApplied}
          authed={authed}
        />
      </div>
    );
  }

  const extras = quote.lines.filter((line) => line.price > 0).length;

  return (
    <div className="space-y-4 rounded-md border border-line bg-white p-5 shadow-sm">
      <KommunSelect />
      <PackageOptions />

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <p className="text-2xl font-semibold text-ink">{formatKr(quote.total)}</p>
          <p className="text-xs text-muted">
            {municipality ? `Pris i ${municipality.name}` : "Grundpris, välj kommun"}
            {extras > 0 && ` · inkl. ${extras} tillval`}
          </p>
        </div>
        <a
          href="#bygg-online"
          className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm text-white shadow-sm transition-colors hover:bg-brand-dark"
        >
          <Icon name="wrench" size={16} />
          Bygg online
        </a>
      </div>

      <ApplyButton
        listingId={listingId}
        initialApplied={initialApplied}
        authed={authed}
      />
    </div>
  );
}
