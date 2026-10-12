import type { Listing } from "@/lib/db/schema";
import { ALL_SPEC_SECTIONS, type SpecKey } from "@/lib/listings/spec-sections";
import { DEFAULT_PACKAGES } from "@/lib/build/defaults";

export const currency = new Intl.NumberFormat("sv-SE");

/** Combining diacritical marks, as left behind by String.normalize("NFD"). */
const COMBINING_MARKS = /[̀-ͯ]/g;

export function formatArea(listing: Pick<Listing, "area" | "areaMax">): string {
  return listing.areaMax
    ? `${listing.area}–${listing.areaMax} m²`
    : `${listing.area} m²`;
}

export function listingTypeLabel(type: Listing["listingType"]): string {
  return type === "attefallshus" ? "Attefallshus" : "Attefallshus med källare";
}

/**
 * Turns "Rydins väg 9" + "Svenljunga" into "rydins-vag-9-svenljunga".
 * Deterministic, so it can run during render without hydration mismatches.
 */
export function slugify(...parts: (string | null | undefined)[]): string {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" ")
    .toLowerCase()
    // NFD splits å/ä/ö into a base letter plus a combining mark, so dropping
    // the marks leaves plain a/a/o.
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function emptyListing(): Listing {
  return {
    id: "",
    listingType: "attefallshus",
    sourceCollection: null,
    city: "",
    rooms: 1,
    area: 0,
    areaMax: null,
    rent: 0,
    available: null,
    floor: null,
    floorsTotal: null,
    elevator: null,
    buildYear: null,
    loftArea: null,
    length: null,
    width: null,
    height: null,
    bedrooms: null,
    documents: [],
    // Start from the standard packages; prices are edited per product.
    packages: DEFAULT_PACKAGES,
    ...(Object.fromEntries(
      ALL_SPEC_SECTIONS.map(({ key }) => [key, [] as string[]])
    ) as Record<SpecKey, string[]>),
    description: "",
    images: [],
    amenities: [],
    viewings: [],
    contacts: null,
  };
}
