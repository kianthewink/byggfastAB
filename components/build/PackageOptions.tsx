"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { formatKr } from "@/lib/build/pricing";
import { useBuild } from "./BuildProvider";

/**
 * The radio list of ways to buy the house, each priced for the chosen
 * kommun, with its campaign line and an ⓘ that reveals the description.
 */
export default function PackageOptions() {
  const build = useBuild();
  const [infoOpen, setInfoOpen] = useState<string | null>(null);
  if (!build) return null;

  return (
    <div
      role="radiogroup"
      aria-label="Köpalternativ"
      className="divide-y divide-line overflow-hidden rounded-md border border-line"
    >
      {build.packages.map((pkg) => {
        const selected = build.config.packageId === pkg.id;
        const price = build.priceOf(pkg.price, pkg.exactPrices);
        return (
          <div
            key={pkg.id}
            className={`transition-colors ${selected ? "bg-surface-3" : "bg-white hover:bg-surface-3/60"}`}
          >
            <div className="flex items-start gap-3 px-4 py-4">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => build.setPackage(pkg.id)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none"
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? "border-brand" : "border-line"
                  }`}
                >
                  {selected && <span className="size-2.5 rounded-full bg-brand" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-sm text-ink">{pkg.name}</span>
                    <span className="whitespace-nowrap text-sm font-semibold text-ink">
                      {formatKr(price)}
                    </span>
                  </span>
                  {pkg.campaign && (
                    <span className="mt-1 block text-right text-sm text-red-600">
                      {pkg.campaign}
                    </span>
                  )}
                </span>
              </button>
              {pkg.description && (
                <button
                  type="button"
                  onClick={() => setInfoOpen((open) => (open === pkg.id ? null : pkg.id))}
                  aria-expanded={infoOpen === pkg.id}
                  aria-label={`Om ${pkg.name}`}
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-muted text-[11px] font-semibold text-muted transition-colors hover:border-brand hover:text-brand"
                >
                  i
                </button>
              )}
            </div>
            {infoOpen === pkg.id && (
              <p className="flex gap-2 px-4 pb-4 pl-12 text-xs leading-relaxed text-muted">
                <Icon name="check" size={14} className="mt-0.5 shrink-0 text-brand" />
                {pkg.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
