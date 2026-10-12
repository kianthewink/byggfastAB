"use server";

import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { applications, listings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user-dal";
import { normalizeConfig, quoteBuild } from "@/lib/build/pricing";
import { sanitizeConfig, sanitizePackages } from "@/lib/build/sanitize";
import { getBuildSettings } from "@/lib/build/settings";

export type ApplyResult =
  | { ok: true; alreadyApplied: boolean }
  | { ok: false; reason: "unauthenticated" | "not-found" | "error" };

/**
 * "Anmäl intresse" — a signed-in visitor registering interest in one listing.
 *
 * Treated as a public endpoint, same as toggleSavedListing: the caller
 * supplies only the listing id, and the applicant always comes from the
 * session. A signed-out caller gets "unauthenticated" back rather than a
 * redirect, so the button can show the login prompt itself without losing
 * the listing the visitor was looking at.
 */
export async function submitApplicationAction(
  listingId: string,
  /** The visitor's Bygg online choices; ids only, priced again here. */
  config?: unknown
): Promise<ApplyResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  if (typeof listingId !== "string" || listingId.length === 0) {
    return { ok: false, reason: "not-found" };
  }

  // Checked first, same reasoning as toggleSavedListing: the foreign key
  // would reject an unknown id anyway, but this turns a thrown constraint
  // error into a clean result.
  const [listing] = await db
    .select({ id: listings.id, packages: listings.packages })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) return { ok: false, reason: "not-found" };

  // Prices come from the database, never from the client — the browser only
  // says which options were picked.
  const { catalog, municipalities } = await getBuildSettings();
  const packages = sanitizePackages(listing.packages);
  const configuration =
    config === undefined
      ? null
      : quoteBuild(
          normalizeConfig(sanitizeConfig(config), catalog, packages, municipalities),
          catalog,
          packages,
          municipalities
        );

  try {
    // Sending again (after changing kommun or options) updates the stored
    // choices rather than creating a second application — there is one per
    // visitor and listing. The insert/update split in `.returning()` (xmax
    // is 0 only for a freshly inserted row) tells the caller which happened.
    const [row] = await db
      .insert(applications)
      .values({ id: randomUUID(), userId: user.id, listingId, configuration })
      .onConflictDoUpdate({
        target: [applications.userId, applications.listingId],
        set: configuration
          ? { configuration, updatedAt: new Date() }
          : { updatedAt: new Date() },
      })
      .returning({ inserted: sql<boolean>`(xmax = 0)` });

    return { ok: true, alreadyApplied: !row?.inserted };
  } catch (error) {
    console.error("Failed to submit application", error);
    return { ok: false, reason: "error" };
  }
}
