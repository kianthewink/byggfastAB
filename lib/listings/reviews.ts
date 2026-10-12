import "server-only";

import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { reviews } from "@/lib/db/schema";

/**
 * Read side of listing reviews. There is no submission flow yet — this is
 * "read-only for now", per the feature's own scope — so unlike
 * lib/listings/saved.ts and applications.ts, nothing here touches who is
 * signed in: reviews are public content, same as the listing itself.
 */

export interface ListingReview {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: Date;
}

/**
 * Every review for a listing, newest first. That's just a sensible default
 * for the initial fetch — the page does its own sorting/filtering
 * client-side (rating high-to-low, low-to-high, or newest) over this same
 * list, since a listing's reviews are few enough that re-sorting a fetched
 * array beats round-tripping to the database for every sort change.
 */
export const getReviewsForListing = cache(
  async (listingId: string): Promise<ListingReview[]> => {
    const rows = await db
      .select({
        id: reviews.id,
        authorName: reviews.authorName,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(eq(reviews.listingId, listingId))
      .orderBy(desc(reviews.createdAt));

    return rows;
  }
);
