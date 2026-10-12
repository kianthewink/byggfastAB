import type {
  BuildCatalog,
  BuildConfig,
  BuildQuote,
  ExactPrices,
  Municipality,
  PurchasePackage,
  QuoteLine,
} from "./types";

/**
 * The one place prices are worked out. The browser uses it to show live
 * totals and the server uses it again when an interest application is sent,
 * so the stored quote never trusts numbers from the client.
 */

/**
 * A base price adjusted for the chosen kommun: an exact price entered for
 * that kommun if there is one, otherwise the base price × the kommun's
 * factor. With no kommun chosen yet, the base price.
 */
export function localPrice(
  base: number,
  exactPrices: ExactPrices,
  municipality: Municipality | null
): number {
  if (!municipality) return base;
  const exact = exactPrices[municipality.id];
  if (exact != null) return exact;
  return Math.round(base * municipality.priceFactor);
}

/**
 * Brings a stored or submitted config in line with the current catalog:
 * unknown ids are dropped (an option may have been deleted since), a
 * single-choice category always has exactly one option (its first, unless
 * one was picked), and the package falls back to the first offered.
 */
export function normalizeConfig(
  config: Partial<BuildConfig> | null | undefined,
  catalog: BuildCatalog,
  packages: PurchasePackage[],
  municipalities: Municipality[]
): BuildConfig {
  const municipalityId = municipalities.some(
    (m) => m.id === config?.municipalityId
  )
    ? config!.municipalityId!
    : null;

  const packageId = packages.some((p) => p.id === config?.packageId)
    ? config!.packageId!
    : (packages[0]?.id ?? null);

  const selections: Record<string, string[]> = {};
  for (const group of catalog.groups) {
    for (const category of group.categories) {
      const valid = (config?.selections?.[category.id] ?? []).filter((id) =>
        category.options.some((o) => o.id === id)
      );
      if (category.multiple) {
        selections[category.id] = [...new Set(valid)];
      } else {
        const first = valid[0] ?? category.options[0]?.id;
        selections[category.id] = first ? [first] : [];
      }
    }
  }

  return { municipalityId, packageId, selections };
}

/** Prices a config. Expects it to have been through normalizeConfig. */
export function quoteBuild(
  config: BuildConfig,
  catalog: BuildCatalog,
  packages: PurchasePackage[],
  municipalities: Municipality[]
): BuildQuote {
  const municipality =
    municipalities.find((m) => m.id === config.municipalityId) ?? null;
  const pkg = packages.find((p) => p.id === config.packageId) ?? null;

  const packagePrice = pkg
    ? localPrice(pkg.price, pkg.exactPrices, municipality)
    : 0;

  const lines: QuoteLine[] = [];
  // Packages without finishing (a bare frame, drawings) take no options.
  if (pkg?.configurable) {
    for (const group of catalog.groups) {
      for (const category of group.categories) {
        const chosen = config.selections[category.id] ?? [];
        for (const option of category.options) {
          if (!chosen.includes(option.id)) continue;
          lines.push({
            group: group.name,
            category: category.name,
            option: option.name,
            price: localPrice(option.price, option.exactPrices, municipality),
          });
        }
      }
    }
  }

  return {
    municipality: municipality
      ? { id: municipality.id, name: municipality.name }
      : null,
    package: pkg ? { id: pkg.id, name: pkg.name, price: packagePrice } : null,
    lines,
    total: packagePrice + lines.reduce((sum, line) => sum + line.price, 0),
  };
}

const sek = new Intl.NumberFormat("sv-SE");

/** "3 890 605 kr" */
export function formatKr(amount: number): string {
  return `${sek.format(amount)} kr`;
}
