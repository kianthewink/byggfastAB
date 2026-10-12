import "server-only";

import { cache } from "react";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { DEFAULT_CATALOG, DEFAULT_MUNICIPALITIES } from "./defaults";
import { sanitizeCatalog, sanitizeMunicipalities } from "./sanitize";
import type { BuildCatalog, Municipality } from "./types";

export const BUILD_SETTINGS_KEYS = {
  catalog: "build_catalog",
  municipalities: "municipalities",
} as const;

export interface BuildSettings {
  catalog: BuildCatalog;
  municipalities: Municipality[];
}

/**
 * Kommuner and the Bygg online catalog, as last saved in the admin panel —
 * or the starting data from ./defaults.ts until something has been saved.
 * Read in one round trip; cached per request.
 */
export const getBuildSettings = cache(async (): Promise<BuildSettings> => {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(
      inArray(siteSettings.key, Object.values(BUILD_SETTINGS_KEYS))
    );
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  const catalog = byKey.has(BUILD_SETTINGS_KEYS.catalog)
    ? sanitizeCatalog(byKey.get(BUILD_SETTINGS_KEYS.catalog))
    : DEFAULT_CATALOG;
  const municipalities = byKey.has(BUILD_SETTINGS_KEYS.municipalities)
    ? sanitizeMunicipalities(byKey.get(BUILD_SETTINGS_KEYS.municipalities))
    : DEFAULT_MUNICIPALITIES;

  return { catalog, municipalities };
});
