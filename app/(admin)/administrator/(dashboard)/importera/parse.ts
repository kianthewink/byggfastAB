import * as XLSX from "xlsx";
import type { Listing, Viewing } from "@/lib/db/schema";
import { isRenderableImageSrc } from "@/lib/image-hosts";
import { ALL_SPEC_SECTIONS, type SpecKey } from "@/lib/listings/spec-sections";
import { sanitizePackages } from "@/lib/build/sanitize";

export type ParsedRow =
  | { rowNumber: number; status: "valid"; listing: Listing; warnings: string[] }
  | {
      rowNumber: number;
      status: "error";
      errors: string[];
      raw: Record<string, unknown>;
    };

function str(v: unknown): string {
  return v === undefined || v === null ? "" : String(v).trim();
}

function nullableStr(v: unknown): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

function nullableNum(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function nullableBool(v: unknown): boolean | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "boolean") return v;
  const s = str(v).toLowerCase();
  if (["true", "1", "yes", "ja", "x"].includes(s)) return true;
  if (["false", "0", "no", "nej"].includes(s)) return false;
  return null;
}

/** "a; b ; c" -> ["a", "b", "c"]. Empty/blank cells become an empty array. */
function semicolonArray(v: unknown): string[] {
  const s = str(v);
  if (!s) return [];
  return s
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Parses the first sheet of an .xlsx/.xls/.csv file into validated Listing rows. */
export function parseWorkbook(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  // Listings are matched by id, so a duplicate id within one file would
  // silently overwrite an earlier row instead of importing both.
  const firstRowById = new Map<string, number>();

  return rows.map((raw, index) => {
    const rowNumber = index + 1; // 1 = first product row, matching what's shown
    const errors: string[] = [];
    const warnings: string[] = [];

    const id = str(raw.id);
    if (!id) {
      errors.push("Saknar id");
    } else {
      const firstRow = firstRowById.get(id);
      if (firstRow !== undefined) {
        errors.push(
          `Dubblett-id "${id}" — används redan på rad ${firstRow}. ` +
            "Ge annonsen ett unikt id för att kunna importera den."
        );
      } else {
        firstRowById.set(id, rowNumber);
      }
    }

    const listingTypeRaw = str(raw.listingType).toLowerCase();
    const listingType =
      listingTypeRaw === "attefallshus" ||
      listingTypeRaw === "attefallshus_med_kallare"
        ? listingTypeRaw
        : null;
    if (!listingType) {
      errors.push(
        'listingType måste vara "attefallshus" eller "attefallshus_med_kallare"'
      );
    }

    const city = str(raw.city);
    if (!city) errors.push("Saknar ort");

    const rooms = nullableNum(raw.rooms);
    if (rooms === null) errors.push("rooms måste vara ett tal");

    const area = nullableNum(raw.area);
    if (area === null) errors.push("area måste vara ett tal");

    const rent = nullableNum(raw.rent);
    if (rent === null) errors.push("rent måste vara ett tal");

    if (errors.length > 0) {
      return { rowNumber, status: "error", errors, raw };
    }

    const images = semicolonArray(raw.images);
    const amenities = semicolonArray(raw.amenities);

    // Not an error: the listing still imports, but next/image refuses to
    // render a photo from a host that isn't allow-listed in
    // next.config.ts (see lib/image-hosts.ts) — it shows a placeholder
    // instead, silently, unless caught here first. Flagging it now means
    // it's noticed at import time instead of by a visitor.
    const unrenderableImages = images.filter((url) => !isRenderableImageSrc(url));
    if (unrenderableImages.length > 0) {
      warnings.push(
        `${unrenderableImages.length} av ${images.length} bild${images.length === 1 ? "" : "er"} ` +
          `kommer visas som platshållare — värden är inte tillåten i next.config.ts: ` +
          unrenderableImages.join(", ")
      );
    }

    // viewingDates and viewingTimes are parallel arrays — same index is the
    // same viewing. A dates entry with no matching times entry gets "".
    const viewingDates = semicolonArray(raw.viewingDates);
    const viewingTimes = semicolonArray(raw.viewingTimes);
    const viewings: Viewing[] = viewingDates.map((date, i) => ({
      date,
      time: viewingTimes[i] ?? "",
    }));

    const listing: Listing = {
      id,
      listingType: listingType as Listing["listingType"],
      sourceCollection: nullableStr(raw.sourceCollection),
      city,
      rooms: rooms as number,
      area: area as number,
      areaMax: nullableNum(raw.areaMax),
      rent: rent as number,
      available: nullableStr(raw.available),
      floor: nullableNum(raw.floor),
      floorsTotal: nullableNum(raw.floorsTotal),
      elevator: nullableBool(raw.elevator),
      buildYear: nullableNum(raw.buildYear),
      loftArea: nullableNum(raw.loftArea),
      length: nullableNum(raw.length),
      width: nullableNum(raw.width),
      height: nullableNum(raw.height),
      bedrooms: nullableNum(raw.bedrooms),
      // "Planritning|https://…/plan.pdf;Produktblad|https://…/blad.pdf"
      documents: semicolonArray(raw.documents).map((entry) => {
        const [name, ...url] = entry.split("|");
        return url.length > 0
          ? { name: name.trim(), url: url.join("|").trim() }
          : { name: "Dokument", url: name.trim() };
      }),
      ...(Object.fromEntries(
        ALL_SPEC_SECTIONS.map(({ key }) => [key, semicolonArray(raw[key])])
      ) as Record<SpecKey, string[]>),
      // "Nyckelfärdig Modul|3305610|Spara 100 000 kr|ja;Ritningspaket|14000||nej"
      // — name|price|campaign|Bygg online applies (ja/nej). An empty column
      // leaves an existing product's packages alone (see importListingsAction).
      packages: sanitizePackages(
        semicolonArray(raw.packages).map((entry, i) => {
          const [name, price, campaign, configurable] = entry.split("|");
          return {
            id: `paket-${i + 1}`,
            name,
            price: Number(String(price ?? "").replace(/\s/g, "")),
            campaign: campaign ?? "",
            configurable: nullableBool(configurable) ?? true,
          };
        })
      ),
      description: nullableStr(raw.description) ?? "",
      images,
      amenities,
      viewings,
      contacts: nullableStr(raw.contacts),
    };

    return { rowNumber, status: "valid", listing, warnings };
  });
}
