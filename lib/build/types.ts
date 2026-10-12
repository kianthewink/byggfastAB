/**
 * Shapes behind the product page's purchase box and "Bygg online"
 * configurator. Shared by the public site, the admin panel and the server
 * actions, so nothing in here may import server-only code.
 */

/**
 * Exact prices per kommun, keyed by Municipality.id. When a kommun has an
 * entry here it wins over the kommun's price factor — this is where real,
 * negotiated per-kommun prices go once they're known.
 */
export type ExactPrices = Record<string, number>;

export interface Municipality {
  id: string;
  name: string;
  /**
   * Multiplier applied to every base price for this kommun (1 = base price,
   * 1.08 = 8 % dearer). A placeholder until exact prices are decided.
   */
  priceFactor: number;
}

/** One way to buy a house — "Nyckelfärdig Modul", "Ritningspaket" … */
export interface PurchasePackage {
  id: string;
  name: string;
  /** Shown behind the ⓘ next to the name. */
  description: string;
  /** Red campaign line under the price, e.g. "Spara upp till 100 000 kr i okt". */
  campaign: string;
  /** Base price in kr, before the kommun adjustment. */
  price: number;
  /**
   * Whether Bygg online choices apply. Off for packages that don't include
   * finishing (a bare frame, drawings only), so their price stays the package
   * price alone.
   */
  configurable: boolean;
  exactPrices: ExactPrices;
}

export interface BuildOption {
  id: string;
  name: string;
  description: string;
  /** Base price in kr on top of the package; 0 = included. */
  price: number;
  /** Optional colour swatch, e.g. "#1f1f1f" for a facade colour. */
  swatch: string | null;
  exactPrices: ExactPrices;
}

export interface BuildCategory {
  id: string;
  name: string;
  description: string;
  /** Checkboxes (any number, e.g. Tillval) instead of exactly one choice. */
  multiple: boolean;
  options: BuildOption[];
}

/** A tab in Bygg online — Exteriör, Interiör, Kök … */
export interface BuildGroup {
  id: string;
  name: string;
  categories: BuildCategory[];
}

export interface BuildCatalog {
  groups: BuildGroup[];
}

/** What a visitor has picked. Ids only — prices are always recomputed. */
export interface BuildConfig {
  municipalityId: string | null;
  packageId: string | null;
  /** categoryId → chosen option ids. */
  selections: Record<string, string[]>;
}

export interface QuoteLine {
  group: string;
  category: string;
  option: string;
  price: number;
}

/**
 * A priced snapshot of a BuildConfig. Stored on the interest application as
 * it was at the time of sending, so the admin panel shows what the visitor
 * was quoted even if prices change later.
 */
export interface BuildQuote {
  municipality: { id: string; name: string } | null;
  package: { id: string; name: string; price: number } | null;
  lines: QuoteLine[];
  total: number;
}
