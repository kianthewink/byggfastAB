import "server-only";

import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, savedListings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user-dal";
import type { Apartment } from "@/lib/types";
import { toApartment } from "./map";

/**
 * Read side of a visitor's saved listings ("sparade objekt").
 *
 * Every getter scopes on the signed-in user's id and returns an empty result
 * when signed out, so there is no way to ask for somebody else's saves — the
 * user id comes from the session cookie, never from an argument.
 */

/** A saved listing plus the route it lives on. */
export interface SavedListing {
  apartment: Apartment;
  listingType: "attefallshus" | "attefallshus_med_kallare";
  savedAt: Date;
}

/** Which route a listing's detail page lives on. */
export function listingHref(
  listingType: "attefallshus" | "attefallshus_med_kallare",
  id: string
): string {
  return listingType === "attefallshus"
    ? `/attefallshus/${id}`
    : `/attefallshus-med-kallare/${id}`;
}

/**
 * Ids only — what the listing grids need to render each heart in the right
 * state without pulling the rows a second time.
 */
export const getSavedListingIds = cache(async (): Promise<Set<string>> => {
  const user = await getCurrentUser();
  if (!user) return new Set<string>();

  const rows = await db
    .select({ listingId: savedListings.listingId })
    .from(savedListings)
    .where(eq(savedListings.userId, user.id));

  return new Set(rows.map((row) => row.listingId));
});

/** The full saved listings, most recently saved first. */
export const getSavedListings = cache(async (): Promise<SavedListing[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await db
    .select({ listing: listings, savedAt: savedListings.createdAt })
    .from(savedListings)
    .innerJoin(listings, eq(listings.id, savedListings.listingId))
    .where(eq(savedListings.userId, user.id))
    .orderBy(desc(savedListings.createdAt));

  return rows.map((row) => ({
    apartment: toApartment(row.listing),
    listingType: row.listing.listingType,
    savedAt: row.savedAt,
  }));
});

/** Badge count for the account menu. */
export const getSavedCount = cache(async (): Promise<number> => {
  const ids = await getSavedListingIds();
  return ids.size;
});

/**
 * Everything a listing page needs to render its hearts: whether there is
 * anyone to save for, and what they've already saved. One call per page
 * instead of a session lookup per card.
 */
export const getSaveContext = cache(
  async (): Promise<{ authed: boolean; savedIds: Set<string> }> => {
    const user = await getCurrentUser();
    if (!user) return { authed: false, savedIds: new Set<string>() };
    return { authed: true, savedIds: await getSavedListingIds() };
  }
);
