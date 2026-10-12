import "server-only";

import { cache } from "react";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, type ListingRow } from "@/lib/db/schema";
import type { Apartment } from "@/lib/types";
import { toApartment } from "./map";

/**
 * Read side of the CMS: the public site's only source of listing data.
 * Everything here is unauthenticated on purpose — these rows are exactly
 * what the site is meant to publish. Writes live in the admin panel
 * (app/(admin)/administrator/(dashboard)/innehall/actions.ts) behind
 * verifySession().
 *
 * Each getter is wrapped in React `cache()` so a page and its
 * generateMetadata() share one query per request instead of two.
 */

async function listByType(
  listingType: "attefallshus" | "attefallshus_med_kallare"
): Promise<Apartment[]> {
  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.listingType, listingType))
    .orderBy(asc(listings.city));

  return rows.map(toApartment);
}

async function findByType(
  id: string,
  listingType: "attefallshus" | "attefallshus_med_kallare"
): Promise<Apartment | null> {
  const [row] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.id, id), eq(listings.listingType, listingType)))
    .limit(1);

  return row ? toApartment(row) : null;
}

/** Attefallshus. */
export const getAttefallshus = cache(() => listByType("attefallshus"));

/** Attefallshus med källare. */
export const getAttefallshusMedKallare = cache(() =>
  listByType("attefallshus_med_kallare")
);

export const getAttefallshusById = cache((id: string) =>
  findByType(id, "attefallshus")
);

export const getAttefallshusMedKallareById = cache((id: string) =>
  findByType(id, "attefallshus_med_kallare")
);

export interface ComparedListing {
  listing: Apartment;
  listingType: ListingRow["listingType"];
}

/**
 * Listings of either type for the /jamfor page, in the order the ids were
 * given (the order the visitor picked them). Unknown ids are skipped.
 */
export const getListingsByIds = cache(
  async (ids: string[]): Promise<ComparedListing[]> => {
    if (ids.length === 0) return [];
    const rows = await db
      .select()
      .from(listings)
      .where(inArray(listings.id, ids));
    const byId = new Map(rows.map((row) => [row.id, row]));
    return ids.flatMap((id) => {
      const row = byId.get(id);
      return row ? [{ listing: toApartment(row), listingType: row.listingType }] : [];
    });
  }
);
