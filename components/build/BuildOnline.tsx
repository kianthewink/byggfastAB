"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import ApplyButton from "@/components/listings/ApplyButton";
import Icon from "@/components/ui/Icon";
import { formatKr } from "@/lib/build/pricing";
import type { BuildCategory, BuildOption } from "@/lib/build/types";
import { useBuild } from "./BuildProvider";
import KommunSelect from "./KommunSelect";
import PackageOptions from "./PackageOptions";

/**
 * "Bygg online": the visitor configures the house tab by tab (Exteriör,
 * Interiör …), ending on a Summering. Every tab, category and option comes
 * from the admin panel (/administrator/bygg-online) — nothing here is
 * hard-coded. Prices follow the chosen kommun live.
 */
export default function BuildOnline({
  initialApplied,
  authed,
}: {
  initialApplied: boolean;
  authed: boolean;
}) {
  const build = useBuild();
  const [tab, setTab] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  if (!build || build.packages.length === 0) return null;

  const { catalog, selectedPackage, quote, municipality } = build;
  const tabNames = [...catalog.groups.map((g) => g.name), "Summering"];
  const lastTab = tabNames.length - 1;
  const isSummary = tab === lastTab;
  const group = catalog.groups[tab];
  const optionsApply = selectedPackage?.configurable ?? false;

  const goTo = (next: number) => {
    setTab(Math.max(0, Math.min(lastTab, next)));
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="bygg-online"
      ref={sectionRef}
      className="mt-14 scroll-mt-6 overflow-hidden rounded-md border border-line"
    >
      <div className="flex flex-col gap-3 bg-brand-dark px-5 py-4 text-white md:flex-row md:items-center md:gap-8">
        <h2 className="flex shrink-0 items-center gap-2 text-xl">
          <Icon name="wrench" size={22} />
          Bygg online
        </h2>
        <nav
          aria-label="Steg i Bygg online"
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:pb-0"
        >
          {tabNames.map((name, i) => (
            <button
              key={name + i}
              type="button"
              onClick={() => goTo(i)}
              aria-current={tab === i ? "step" : undefined}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
                tab === i
                  ? "bg-white text-brand-dark"
                  : "text-white/80 hover:bg-white/15 hover:text-white"
              }`}
            >
              {name}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid gap-8 bg-surface-3 p-5 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          {tab === 0 && (
            <>
              <div>
                <h3 className="mb-3 text-lg text-brand">Kommun</h3>
                <KommunSelect />
              </div>
              <div>
                <h3 className="mb-3 text-lg text-brand">Köpalternativ</h3>
                <PackageOptions />
              </div>
            </>
          )}

          {!isSummary && selectedPackage && !optionsApply && (
            <p className="flex gap-3 rounded-md border border-brand/30 bg-white p-4 text-sm leading-relaxed text-ink">
              <Icon name="shield" size={18} className="mt-0.5 shrink-0 text-brand" />
              Tillvalen gäller inte för {selectedPackage.name}. Välj ett
              modulpaket under Köpalternativ för att bygga ditt hus.
            </p>
          )}

          {!isSummary &&
            group?.categories.map((category) => (
              <CategoryPicker
                key={category.id}
                category={category}
                disabled={!optionsApply}
              />
            ))}

          {isSummary && <SummaryDetails />}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-md border border-line bg-white shadow-sm">
            <div className="relative aspect-[4/3] w-full bg-neutral-100">
              <Image
                src={build.image}
                alt=""
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h3 className="text-lg text-brand">Dina val</h3>
                <p className="text-sm text-muted">
                  {build.title}
                  {municipality && ` · ${municipality.name}`}
                </p>
              </div>

              <ul className="space-y-2 border-t border-line pt-4 text-sm">
                {quote.package && (
                  <li className="flex justify-between gap-3">
                    <span className="text-ink">{quote.package.name}</span>
                    <span className="whitespace-nowrap text-ink">
                      {formatKr(quote.package.price)}
                    </span>
                  </li>
                )}
                {quote.lines
                  .filter((line) => line.price > 0)
                  .map((line) => (
                    <li
                      key={`${line.category}-${line.option}`}
                      className="flex justify-between gap-3 text-muted"
                    >
                      <span>
                        {line.category}: {line.option}
                      </span>
                      <span className="whitespace-nowrap">{formatKr(line.price)}</span>
                    </li>
                  ))}
              </ul>

              <div className="flex items-baseline justify-between gap-3 border-t border-line pt-4">
                <span className="text-sm text-ink">Totalt</span>
                <span className="text-xl font-semibold text-ink">
                  {formatKr(quote.total)}
                </span>
              </div>
              {!municipality && (
                <p className="text-xs text-muted">
                  Grundpris — välj kommun för att se ditt pris.
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goTo(tab - 1)}
                  disabled={tab === 0}
                  aria-label="Föregående steg"
                  className="flex size-10 shrink-0 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-40"
                >
                  <Icon name="chevron-left" size={18} />
                </button>
                {isSummary ? (
                  <ApplyButton
                    listingId={build.listingId}
                    initialApplied={initialApplied}
                    authed={authed}
                    label="Skicka intresseanmälan"
                    className="flex-1"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => goTo(tab + 1)}
                    className="flex-1 rounded-md bg-brand px-4 py-2.5 text-sm text-white transition-colors hover:bg-brand-dark"
                  >
                    Nästa ({tab + 1}/{tabNames.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function CategoryPicker({
  category,
  disabled,
}: {
  category: BuildCategory;
  disabled: boolean;
}) {
  const build = useBuild()!;
  const chosen = build.config.selections[category.id] ?? [];

  return (
    <div className={disabled ? "opacity-50" : undefined}>
      <h3 className="text-lg text-brand">{category.name}</h3>
      {category.description && (
        <p className="mt-0.5 text-sm text-muted">{category.description}</p>
      )}
      <div
        role={category.multiple ? "group" : "radiogroup"}
        aria-label={category.name}
        className="mt-3 grid gap-3 sm:grid-cols-2"
      >
        {category.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            multiple={category.multiple}
            selected={chosen.includes(option.id)}
            disabled={disabled}
            onSelect={() => build.chooseOption(category.id, option.id)}
          />
        ))}
      </div>
    </div>
  );
}

function OptionCard({
  option,
  multiple,
  selected,
  disabled,
  onSelect,
}: {
  option: BuildOption;
  multiple: boolean;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const build = useBuild()!;
  const price = build.priceOf(option.price, option.exactPrices);

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-md border bg-white p-4 text-left transition-all disabled:cursor-not-allowed ${
        selected
          ? "border-brand ring-1 ring-brand"
          : "border-line enabled:hover:border-brand/50 enabled:hover:shadow-sm"
      }`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center border-2 transition-colors ${
          multiple ? "rounded" : "rounded-full"
        } ${selected ? "border-brand bg-brand text-white" : "border-line"}`}
      >
        {selected && <Icon name="check" size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink">{option.name}</span>
        <span className="block text-sm text-muted">
          {price === 0 ? "Ingår" : formatKr(price)}
        </span>
        {option.description && (
          <span className="mt-1 block text-xs leading-relaxed text-muted">
            {option.description}
          </span>
        )}
      </span>
      {option.swatch && (
        <span
          aria-hidden
          className="size-8 shrink-0 rounded-full border border-line shadow-inner"
          style={{ backgroundColor: option.swatch }}
        />
      )}
    </button>
  );
}

/** Everything picked, tab by tab — the last step before sending. */
function SummaryDetails() {
  const { quote, catalog, selectedPackage } = useBuild()!;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg text-brand">Summering</h3>
        <p className="mt-0.5 text-sm text-muted">
          Kontrollera dina val och skicka en intresseanmälan — vi kontaktar dig
          med en offert.
        </p>
      </div>

      <dl className="divide-y divide-line rounded-md border border-line bg-white text-sm">
        <SummaryRow label="Kommun" value={quote.municipality?.name ?? "Ej vald"} />
        <SummaryRow
          label="Köpalternativ"
          value={quote.package?.name ?? "—"}
          price={quote.package?.price}
        />
      </dl>

      {selectedPackage?.configurable &&
        catalog.groups.map((group) => {
          const lines = quote.lines.filter((line) => line.group === group.name);
          if (lines.length === 0) return null;
          return (
            <div key={group.id}>
              <h4 className="mb-2 text-sm text-muted label-caps">{group.name}</h4>
              <dl className="divide-y divide-line rounded-md border border-line bg-white text-sm">
                {lines.map((line) => (
                  <SummaryRow
                    key={`${line.category}-${line.option}`}
                    label={line.category}
                    value={line.option}
                    price={line.price}
                  />
                ))}
              </dl>
            </div>
          );
        })}

      <p className="flex items-baseline justify-between rounded-md bg-white px-4 py-4 text-ink">
        <span>Totalt</span>
        <span className="text-xl font-semibold">{formatKr(quote.total)}</span>
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  price,
}: {
  label: string;
  value: string;
  price?: number;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="flex gap-4 text-ink">
        <span>{value}</span>
        {price != null && (
          <span className="whitespace-nowrap font-medium">
            {price === 0 ? "Ingår" : formatKr(price)}
          </span>
        )}
      </dd>
    </div>
  );
}
