/**
 * The accordion sections in a product's "Teknisk specifikation" and
 * "Installation & montering" side panels.
 *
 * Each section is its own column in the `listings` table (a jsonb string
 * array) and its own column in the import spreadsheet, named by `key` with
 * items separated by ";". One entry → shown as a paragraph; several → a
 * numbered list.
 *
 * Adding a section: add it here, add the matching column in
 * lib/db/schema.ts, and run `npm run db:generate`.
 */

export interface SpecSection {
  /** Property on Listing/Apartment, and the spreadsheet column name. */
  key: SpecKey;
  label: string;
}

export const TECH_SPEC_SECTIONS = [
  { key: "specTak", label: "Tak" },
  { key: "specTakdimensionering", label: "Takdimensionering/snölaster" },
  { key: "specYttervagg", label: "Yttervägg" },
  { key: "specGolvbjalklag", label: "Golvbjälklag" },
  { key: "specGolvbjalklagVatrum", label: "Golvbjälklag våtrum" },
  { key: "specMellanbjalklag", label: "Mellanbjälklag (Loft)" },
  { key: "specInnervagg", label: "Innervägg" },
  { key: "specInnervaggVatrum", label: "Innervägg våtrum" },
] as const;

export const INSTALLATION_SECTIONS = [
  { key: "installUtvandigMalning", label: "Utvändig målning" },
  { key: "installFonsterDorrar", label: "Fönster och dörrar" },
  { key: "installPlat", label: "Plåt" },
  { key: "installAvvattning", label: "Avvattning" },
  { key: "installUppvarmning", label: "Uppvärmning" },
  { key: "installVentilation", label: "Ventilation" },
  { key: "installBadrum", label: "Badrum" },
  { key: "installKok", label: "Kök" },
] as const;

export type SpecKey =
  | (typeof TECH_SPEC_SECTIONS)[number]["key"]
  | (typeof INSTALLATION_SECTIONS)[number]["key"];

export const ALL_SPEC_SECTIONS: readonly SpecSection[] = [
  ...TECH_SPEC_SECTIONS,
  ...INSTALLATION_SECTIONS,
];

/** A PDF attached to a listing, shown in the "Dokument" side panel. */
export interface ListingDocument {
  name: string;
  url: string;
}

/** Drops blank lines left over from editing in a textarea. */
export function cleanSpecItems(items: string[] | null | undefined): string[] {
  return (items ?? []).map((item) => item.trim()).filter(Boolean);
}
