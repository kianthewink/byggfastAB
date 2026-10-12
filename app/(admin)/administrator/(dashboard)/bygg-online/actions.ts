"use server";

import { inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { db } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { DEFAULT_CATALOG, DEFAULT_MUNICIPALITIES } from "@/lib/build/defaults";
import { sanitizeCatalog, sanitizeMunicipalities } from "@/lib/build/sanitize";
import { BUILD_SETTINGS_KEYS, type BuildSettings } from "@/lib/build/settings";

/**
 * Saves kommuner and the Bygg online catalog. Both documents go in one
 * multi-row upsert — a single statement — so they can never end up half
 * saved. Product pages are rendered per request, so the change is live on
 * the next page load.
 */
export async function saveBuildSettingsAction(
  input: BuildSettings
): Promise<BuildSettings> {
  await verifySession();

  const saved: BuildSettings = {
    catalog: sanitizeCatalog(input?.catalog),
    municipalities: sanitizeMunicipalities(input?.municipalities),
  };
  const now = new Date();

  await db
    .insert(siteSettings)
    .values([
      { key: BUILD_SETTINGS_KEYS.catalog, value: saved.catalog, updatedAt: now },
      {
        key: BUILD_SETTINGS_KEYS.municipalities,
        value: saved.municipalities,
        updatedAt: now,
      },
    ])
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: sql`excluded.value`, updatedAt: now },
    });

  revalidatePath("/administrator/bygg-online");
  return saved;
}

/** Back to the starting data in lib/build/defaults.ts. */
export async function resetBuildSettingsAction(): Promise<BuildSettings> {
  await verifySession();
  await db
    .delete(siteSettings)
    .where(inArray(siteSettings.key, Object.values(BUILD_SETTINGS_KEYS)));
  revalidatePath("/administrator/bygg-online");
  return { catalog: DEFAULT_CATALOG, municipalities: DEFAULT_MUNICIPALITIES };
}
