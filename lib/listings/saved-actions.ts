"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listings, savedListings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user-dal";

export type ToggleSavedResult =
  | { ok: true; saved: boolean }
  | { ok: false; reason: "unauthenticated" | "not-found" | "error" };

/**
 * Adds or removes a listing from the signed-in visitor's saved list.
 *
 * Treated as a public endpoint: the caller supplies only the listing id, and
 * the owning user always comes from the session. A signed-out caller gets
 * "unauthenticated" back rather than a redirect, so the heart button can
 * send them to the login page itself without losing its place.
 */
export async function toggleSavedListing(
  listingId: string,
  saved: boolean
): Promise<ToggleSavedResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  if (typeof listingId !== "string" || listingId.length === 0) {
    return { ok: false, reason: "not-found" };
  }

  try {
    if (saved) {
      // Check first: the foreign key would reject an unknown id anyway, but
      // this turns a thrown constraint error into a clean result.
      const [listing] = await db
        .select({ id: listings.id })
        .from(listings)
        .where(eq(listings.id, listingId))
        .limit(1);

      if (!listing) return { ok: false, reason: "not-found" };

      await db
        .insert(savedListings)
        .values({ userId: user.id, listingId })
        // Double-clicking the heart shouldn't be a primary key violation.
        .onConflictDoNothing();
    } else {
      await db
        .delete(savedListings)
        .where(
          and(
            eq(savedListings.userId, user.id),
            eq(savedListings.listingId, listingId)
          )
        );
    }
  } catch (error) {
    console.error("Failed to toggle saved listing", error);
    return { ok: false, reason: "error" };
  }

  // The account menu's counter lives in the site layout, so the whole layout
  // has to be revalidated for the badge to keep up with the heart.
  revalidatePath("/", "layout");

  return { ok: true, saved };
}
