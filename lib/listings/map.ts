import type { Listing } from "@/lib/db/schema";
import type { Apartment, ListingContact } from "@/lib/types";
import { BOFAST_CONTACTS } from "@/data/contacts";
import { isRenderableImageSrc, normalizeImageSrc } from "@/lib/image-hosts";
import {
  ALL_SPEC_SECTIONS,
  cleanSpecItems,
  type SpecKey,
} from "./spec-sections";
import { sanitizePackages } from "@/lib/build/sanitize";

/**
 * Bridges the database row shape to the shape the public site's components
 * expect. Two differences to reconcile:
 *
 *  - Optional columns are `null` in Postgres but `undefined` in the UI type.
 *  - `contacts` is a single free-text admin field, not a relation.
 */

/** Shown when a listing has no images yet, so cards/galleries never break. */
export const PLACEHOLDER_IMAGE = "/placeholder-listing.svg";

/** Value the seed data uses to mean "the standard BOFAST contact block". */
const SHARED_CONTACTS_SENTINEL = "BOFAST_CONTACTS";

function optional<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

/**
 * Admin stores contacts as free text. Accepts one "Namn, telefon" pair per
 * line (or separated by ";"), and falls back to the shared BOFAST block for
 * the sentinel value or anything unparseable — a listing should never lose
 * its "who do I call" box because the text was typed loosely.
 */
export function parseContacts(raw: string | null): ListingContact[] {
  const value = raw?.trim();
  if (!value || value.toUpperCase() === SHARED_CONTACTS_SENTINEL) {
    return BOFAST_CONTACTS;
  }

  const parsed = value
    .split(/[;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, ...rest] = entry.split(",");
      return { name: name.trim(), phone: rest.join(",").trim() };
    })
    .filter((contact) => contact.name && contact.phone);

  return parsed.length > 0 ? parsed : BOFAST_CONTACTS;
}

/**
 * Drops any image URL next/image can't safely render (see lib/image-hosts.ts
 * for why this matters — one bad host here used to crash the whole page) and
 * falls back to the placeholder if nothing usable is left, same as an empty
 * array always has.
 */
function safeImages(images: string[] | null): string[] {
  const usable = (images ?? [])
    .filter(isRenderableImageSrc)
    .map(normalizeImageSrc);
  return usable.length > 0 ? usable : [PLACEHOLDER_IMAGE];
}

export function toApartment(row: Listing): Apartment {
  return {
    id: row.id,
    city: row.city,
    images: safeImages(row.images),
    area: row.area,
    rooms: row.rooms,
    rent: row.rent,
    available: optional(row.available),
    floor: optional(row.floor),
    floorsTotal: optional(row.floorsTotal),
    elevator: optional(row.elevator),
    buildYear: optional(row.buildYear),
    viewings: row.viewings ?? [],
    areaMax: optional(row.areaMax),
    description: row.description || undefined,
    contacts: parseContacts(row.contacts),
    amenities: row.amenities ?? [],
    loftArea: optional(row.loftArea),
    length: optional(row.length),
    width: optional(row.width),
    height: optional(row.height),
    bedrooms: optional(row.bedrooms),
    documents: row.documents ?? [],
    packages: sanitizePackages(row.packages),
    specs: Object.fromEntries(
      ALL_SPEC_SECTIONS.map(({ key }) => [key, cleanSpecItems(row[key])])
    ) as Record<SpecKey, string[]>,
  };
}
