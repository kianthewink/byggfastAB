import "server-only";

import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { applications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user-dal";

/**
 * Read side of "anmäl intresse" for the public listing pages — the
 * counterpart to lib/listings/saved.ts for the applications table.
 *
 * Scoped to the signed-in visitor's own id, same as the saved-listings
 * reads, so a detail page can render "redan anmält" without ever asking for
 * anyone else's applications.
 */
export const hasAppliedToListing = cache(
  async (listingId: string): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    const [row] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.userId, user.id),
          eq(applications.listingId, listingId)
        )
      )
      .limit(1);

    return !!row;
  }
);
