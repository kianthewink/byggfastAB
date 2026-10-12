"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { KOMMUN_STORAGE_KEY, readStorage, writeStorage } from "@/lib/browser-storage";
import { formatKr, localPrice } from "@/lib/build/pricing";
import type { Municipality } from "@/lib/build/types";
import { MAX_COMPARE, compareHref } from "@/lib/compare";
import {
  INSTALLATION_SECTIONS,
  TECH_SPEC_SECTIONS,
} from "@/lib/listings/spec-sections";
import type { Apartment } from "@/lib/types";
import { useCompare } from "./CompareProvider";

export interface CompareProduct {
  listing: Apartment;
  typeLabel: string;
  href: string;
}

/** One cell: `text` is what "only differences" compares, `node` what's shown. */
interface Cell {
  text: string;
  node?: ReactNode;
  /** The number "best value" highlighting ranks by; null = no value. */
  value?: number | null;
}

interface Row {
  label: string;
  cells: Cell[];
  /** Highlight the lowest (prices) or highest (sizes) value in the row. */
  best?: "min" | "max";
  bestLabel?: string;
}

interface Section {
  title: string;
  rows: Row[];
}

const EMPTY = "—";
const decimal = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat("sv-SE");

function num(value: number | null | undefined, unit = ""): Cell {
  return value == null
    ? { text: EMPTY, value: null }
    : { text: `${decimal.format(value)}${unit}`, value };
}

function kr(value: number | null): Cell {
  return value == null ? { text: EMPTY, value: null } : { text: formatKr(value), value };
}

function list(items: string[] | undefined): Cell {
  if (!items || items.length === 0) return { text: EMPTY };
  return {
    text: items.join(" ; "),
    node:
      items.length === 1 ? (
        <p>{items[0]}</p>
      ) : (
        <ol className="list-decimal space-y-0.5 pl-4">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ),
  };
}

/** Bounding volume L × B × H — the basis for price per m³. */
function volumeOf(listing: Apartment): number | null {
  const { length, width, height } = listing;
  return length != null && width != null && height != null
    ? length * width * height
    : null;
}

/**
 * The /jamfor comparison: one column per house, rows grouped into price,
 * measurements, purchase options, the full technical specification and
 * installation details. Prices follow the chosen kommun and package, like
 * on the product pages.
 */
export default function CompareTable({
  products,
  municipalities,
}: {
  products: CompareProduct[];
  municipalities: Municipality[];
}) {
  const router = useRouter();
  const compare = useCompare();
  const [municipalityId, setMunicipalityId] = useState<string | null>(null);
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  // Every package name offered by any of the houses, in first-seen order —
  // the price row compares like with like ("Nyckelfärdig Modul" vs the same).
  const packageNames = useMemo(
    () => [...new Set(products.flatMap((p) => p.listing.packages.map((pkg) => pkg.name)))],
    [products]
  );
  const [chosenPackage, setPackageName] = useState(packageNames[0] ?? "");
  // Falls back if the house that offered the chosen package was removed.
  const packageName = packageNames.includes(chosenPackage)
    ? chosenPackage
    : (packageNames[0] ?? "");

  const municipality = municipalities.find((m) => m.id === municipalityId) ?? null;

  // The kommun follows the visitor around the site; restored after mount so
  // hydration matches the server render.
  useEffect(() => {
    const saved = readStorage<string>(KOMMUN_STORAGE_KEY);
    const timer = window.setTimeout(() => {
      if (saved && municipalities.some((m) => m.id === saved)) setMunicipalityId(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [municipalities]);

  // A shared /jamfor link defines the list: adopt it, so the toggles and the
  // compare bar elsewhere on the site agree with what's on screen.
  const { items, replace } = compare;
  useEffect(() => {
    const shownIds = products.map((p) => p.listing.id).join(",");
    if (items.map((i) => i.id).join(",") === shownIds) return;
    replace(
      products.map((p) => ({
        id: p.listing.id,
        title: `${p.typeLabel} i ${p.listing.city}`,
        image: p.listing.images[0],
      }))
    );
    // Only when the page's products change — not on every list change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const chooseMunicipality = (id: string | null) => {
    setMunicipalityId(id);
    if (id) writeStorage(KOMMUN_STORAGE_KEY, id);
  };

  const removeProduct = (id: string) => {
    compare.remove(id);
    router.replace(compareHref(products.map((p) => p.listing.id).filter((x) => x !== id)), {
      scroll: false,
    });
  };

  const sections = useMemo<Section[]>(() => {
    const priced = products.map(({ listing }) => {
      const pkg = listing.packages.find((p) => p.name === packageName);
      const price = pkg ? localPrice(pkg.price, pkg.exactPrices, municipality) : null;
      const volume = volumeOf(listing);
      return {
        price,
        perM3: price != null && volume ? Math.round(price / volume) : null,
        perM2: price != null && listing.area ? Math.round(price / listing.area) : null,
        volume,
      };
    });

    return [
      {
        title: "Pris",
        rows: [
          {
            label: packageName || "Pris",
            cells: priced.map((p) =>
              p.price == null
                ? { text: "Erbjuds inte", value: null }
                : kr(p.price)
            ),
            best: "min",
            bestLabel: "Lägst pris",
          },
          {
            label: "Pris per m³",
            cells: priced.map((p) =>
              p.perM3 == null ? { text: EMPTY, value: null } : { text: `${integer.format(p.perM3)} kr/m³`, value: p.perM3 }
            ),
            best: "min",
            bestLabel: "Lägst per m³",
          },
          {
            label: "Pris per m² boarea",
            cells: priced.map((p) =>
              p.perM2 == null ? { text: EMPTY, value: null } : { text: `${integer.format(p.perM2)} kr/m²`, value: p.perM2 }
            ),
            best: "min",
            bestLabel: "Lägst per m²",
          },
        ],
      },
      {
        title: "Mått och rum",
        rows: [
          { label: "Typ", cells: products.map((p) => ({ text: p.typeLabel })) },
          { label: "Ort", cells: products.map((p) => ({ text: p.listing.city })) },
          {
            label: "Boarea",
            // An area range (e.g. 200–880 m²) ranks by its smallest size.
            cells: products.map(({ listing }) =>
              listing.areaMax
                ? { text: `${decimal.format(listing.area)}–${decimal.format(listing.areaMax)} m²`, value: listing.area }
                : num(listing.area, " m²")
            ),
            best: "max",
            bestLabel: "Störst",
          },
          { label: "Loft", cells: products.map((p) => num(p.listing.loftArea, " m²")) },
          {
            label: "Total yta",
            cells: products.map((p) => num(p.listing.area + (p.listing.loftArea ?? 0), " m²")),
            best: "max",
            bestLabel: "Störst",
          },
          { label: "Längd", cells: products.map((p) => num(p.listing.length, " m")) },
          { label: "Bredd", cells: products.map((p) => num(p.listing.width, " m")) },
          { label: "Höjd", cells: products.map((p) => num(p.listing.height, " m")) },
          {
            label: "Volym (L × B × H)",
            cells: priced.map((p) => num(p.volume == null ? null : Math.round(p.volume * 10) / 10, " m³")),
            best: "max",
            bestLabel: "Störst",
          },
          { label: "Sovrum", cells: products.map((p) => num(p.listing.bedrooms)), best: "max", bestLabel: "Flest" },
          { label: "Antal rum", cells: products.map((p) => num(p.listing.rooms)), best: "max", bestLabel: "Flest" },
          // A year, not a quantity: no thousands separator.
          { label: "Byggår", cells: products.map((p) => ({ text: p.listing.buildYear ? String(p.listing.buildYear) : EMPTY })) },
          { label: "Våning", cells: products.map((p) => num(p.listing.floor)) },
          { label: "Inflyttning", cells: products.map((p) => ({ text: p.listing.available ?? EMPTY })) },
          {
            label: "Hyra",
            cells: products.map((p) => (p.listing.rent ? { text: `${formatKr(p.listing.rent)}/mån` } : { text: EMPTY })),
          },
        ],
      },
      {
        title: "Alla köpalternativ",
        rows: packageNames.map((name) => ({
          label: name,
          cells: products.map(({ listing }) => {
            const pkg = listing.packages.find((p) => p.name === name);
            return pkg
              ? kr(localPrice(pkg.price, pkg.exactPrices, municipality))
              : { text: "Erbjuds inte", value: null };
          }),
          best: "min" as const,
          bestLabel: "Lägst",
        })),
      },
      {
        title: "Teknisk specifikation",
        rows: TECH_SPEC_SECTIONS.map(({ key, label }) => ({
          label,
          cells: products.map((p) => list(p.listing.specs[key])),
        })),
      },
      {
        title: "Installation & montering",
        rows: INSTALLATION_SECTIONS.map(({ key, label }) => ({
          label,
          cells: products.map((p) => list(p.listing.specs[key])),
        })),
      },
      {
        title: "Övrigt",
        rows: [
          { label: "Bekvämligheter", cells: products.map((p) => list(p.listing.amenities)) },
          {
            label: "Dokument",
            cells: products.map(({ listing }) =>
              listing.documents.length === 0
                ? { text: EMPTY }
                : {
                    text: listing.documents.map((d) => d.name).join(" ; "),
                    node: (
                      <ul className="space-y-1">
                        {listing.documents.map((doc) => (
                          <li key={doc.url}>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-brand hover:underline"
                            >
                              <Icon name="file-pdf" size={14} />
                              {doc.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ),
                  }
            ),
          },
        ],
      },
    ];
  }, [municipality, packageName, packageNames, products]);

  const visible = sections
    .map((section) => ({
      ...section,
      rows: section.rows.filter((row) => {
        // Nobody has a value: nothing to compare.
        if (row.cells.every((c) => c.text === EMPTY)) return false;
        if (onlyDifferences) return new Set(row.cells.map((c) => c.text)).size > 1;
        return true;
      }),
    }))
    .filter((section) => section.rows.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4 rounded-md border border-line bg-surface-3 p-4">
        <label className="flex min-w-48 flex-col gap-1.5 text-sm text-ink">
          Kommun
          <select
            value={municipalityId ?? ""}
            onChange={(e) => chooseMunicipality(e.target.value || null)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Välj kommun (grundpris)</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        {packageNames.length > 0 && (
          <label className="flex min-w-64 flex-col gap-1.5 text-sm text-ink">
            Jämför pris för
            <select
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand"
            >
              {packageNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-2 py-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={onlyDifferences}
            onChange={(e) => setOnlyDifferences(e.target.checked)}
            className="size-4 accent-[#22548f]"
          />
          Visa bara skillnader
        </label>
      </div>

      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <colgroup>
            <col className="w-44" />
            {products.map((p) => (
              <col key={p.listing.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white p-4 text-left align-bottom font-normal text-muted">
                {products.length < MAX_COMPARE && (
                  <Link href="/attefallshus" className="text-sm text-brand hover:underline">
                    + Lägg till hus
                  </Link>
                )}
              </th>
              {products.map(({ listing, typeLabel, href }) => (
                <th key={listing.id} className="min-w-52 p-4 text-left align-top font-normal">
                  <div className="relative">
                    <Link href={href} className="block">
                      <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-neutral-100">
                        <Image src={listing.images[0]} alt="" fill sizes="260px" className="object-cover" />
                      </span>
                      <span className="mt-2 block text-base text-brand hover:underline">{listing.city}</span>
                      <span className="block text-xs text-muted">{typeLabel}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeProduct(listing.id)}
                      aria-label={`Ta bort ${typeLabel} i ${listing.city} från jämförelsen`}
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white hover:text-brand"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {visible.map((section) => (
            <tbody key={section.title}>
              <tr>
                <th
                  colSpan={products.length + 1}
                  className="border-t border-line bg-surface px-4 py-2.5 text-left text-xs font-normal tracking-wide text-brand label-caps"
                >
                  {section.title}
                </th>
              </tr>
              {section.rows.map((row) => (
                <CompareRow key={row.label} row={row} />
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-muted">Husen är identiska i allt som kan jämföras.</p>
      )}
      {!municipality && (
        <p className="text-xs text-muted">
          Priserna är grundpriser. Välj kommun för att se vad husen kostar där du ska bygga.
        </p>
      )}
    </div>
  );
}

function CompareRow({ row }: { row: Row }) {
  const values = row.cells.map((c) => c.value).filter((v): v is number => v != null);
  const target =
    row.best && values.length > 1 && new Set(values).size > 1
      ? row.best === "min"
        ? Math.min(...values)
        : Math.max(...values)
      : null;

  return (
    <tr className="border-t border-line align-top">
      <th
        scope="row"
        className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-normal text-muted"
      >
        {row.label}
      </th>
      {row.cells.map((cell, i) => {
        const isBest = target != null && cell.value === target;
        return (
          <td
            key={i}
            className={`px-4 py-3 leading-relaxed ${
              isBest ? "bg-surface-3 font-semibold text-brand" : "text-ink"
            }`}
          >
            {cell.node ?? cell.text}
            {isBest && row.bestLabel && (
              <span className="mt-1 flex items-center gap-1 text-xs font-normal text-brand">
                <Icon name="check" size={12} />
                {row.bestLabel}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
}
