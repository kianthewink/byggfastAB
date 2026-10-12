"use server";

import { eq, inArray, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { db } from "@/lib/db/client";
import { listings as listingsTable, type Listing } from "@/lib/db/schema";
import { LISTINGS as SEED_LISTINGS } from "@/lib/db/seed-data";
import { ALL_SPEC_SECTIONS, cleanSpecItems } from "@/lib/listings/spec-sections";
import { DEFAULT_PACKAGES } from "@/lib/build/defaults";
import { sanitizePackages } from "@/lib/build/sanitize";

function fromRow(row: typeof listingsTable.$inferSelect): Listing {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdAt, updatedAt, ...listing } = row;
  return listing;
}

/**
 * The spec textareas in the admin form keep blank lines while typing, and a
 * document row can be left half-filled — neither should reach the database.
 */
function clean(listing: Listing): Listing {
  const specs = Object.fromEntries(
    ALL_SPEC_SECTIONS.map(({ key }) => [key, cleanSpecItems(listing[key])])
  );
  return {
    ...listing,
    ...specs,
    packages: sanitizePackages(listing.packages),
    documents: listing.documents
      .map((doc) => ({ name: doc.name.trim() || "Dokument", url: doc.url.trim() }))
      .filter((doc) => doc.url),
  };
}

export async function getListings(): Promise<Listing[]> {
  await verifySession();
  const rows = await db
    .select()
    .from(listingsTable)
    .orderBy(listingsTable.city);
  return rows.map(fromRow);
}

export async function updateListingAction(input: Listing): Promise<Listing> {
  await verifySession();
  const listing = clean(input);
  const [row] = await db
    .update(listingsTable)
    .set({ ...listing, updatedAt: new Date() })
    .where(eq(listingsTable.id, listing.id))
    .returning();
  revalidatePath("/administrator/innehall");
  return fromRow(row);
}

export type ImportSummary = {
  added: number;
  updated: number;
  skipped: number;
};

/**
 * "all" upserts every row. "new" only inserts rows whose id doesn't exist
 * yet (existing ids are skipped, left untouched). "update" only updates rows
 * whose id already exists (new ids are skipped, not created).
 */
export type ImportMode = "all" | "new" | "update";

export async function importListingsAction(
  incoming: Listing[],
  mode: ImportMode = "all"
): Promise<ImportSummary> {
  await verifySession();
  if (incoming.length === 0) return { added: 0, updated: 0, skipped: 0 };

  const ids = incoming.map((l) => l.id);
  const existing = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(inArray(listingsTable.id, ids));
  const existingIds = new Set(existing.map((r) => r.id));

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const listing of incoming) {
    const isExisting = existingIds.has(listing.id);
    if (mode === "new" && isExisting) {
      skipped += 1;
      continue;
    }
    if (mode === "update" && !isExisting) {
      skipped += 1;
      continue;
    }

    if (isExisting) updated += 1;
    else added += 1;

    // A sheet without a `packages` column shouldn't wipe the purchase
    // options already set up in the admin panel: existing products keep
    // theirs, new ones start with the standard packages.
    const row = clean(listing);
    const { packages, ...rest } = row;
    await db
      .insert(listingsTable)
      .values({ ...row, packages: packages.length ? packages : DEFAULT_PACKAGES })
      .onConflictDoUpdate({
        target: listingsTable.id,
        set: {
          ...(packages.length ? row : rest),
          updatedAt: new Date(),
        },
      });
  }

  revalidatePath("/administrator/innehall");
  return { added, updated, skipped };
}

export async function resetToSeedAction(): Promise<Listing[]> {
  await verifySession();

  // Deliberately NOT "delete everything, then re-insert". saved_listings
  // cascades on listing deletion, so wiping the table would clear every
  // visitor's saved list — including for the seed listings that reappear a
  // line later with the same ids. Dropping only the rows the seed doesn't
  // contain leaves the listings table in exactly the same end state while
  // keeping saves that still point at something real.
  const seedIds = SEED_LISTINGS.map((listing) => listing.id);
  await db.delete(listingsTable).where(notInArray(listingsTable.id, seedIds));

  for (const listing of SEED_LISTINGS) {
    await db
      .insert(listingsTable)
      .values(listing)
      .onConflictDoUpdate({
        target: listingsTable.id,
        set: { ...listing, updatedAt: new Date() },
      });
  }

  revalidatePath("/administrator/innehall");
  return SEED_LISTINGS;
}

export async function deleteListingAction(id: string): Promise<void> {
  await verifySession();
  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  revalidatePath("/administrator/innehall");
}

export type CreateResult =
  | { ok: true; listing: Listing }
  | { ok: false; error: string };

export async function createListingAction(
  listing: Listing
): Promise<CreateResult> {
  await verifySession();

  // Mirror the client-side checks — a Server Action is a public endpoint, so
  // it can't trust that the form validated anything.
  const id = listing.id.trim();
  if (!id) return { ok: false, error: "Id måste fyllas i." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    return {
      ok: false,
      error:
        "Id får bara innehålla små bokstäver, siffror och enkla bindestreck (t.ex. storgatan-14-ljungby).",
    };
  }
  if (!listing.city.trim())
    return { ok: false, error: "Ort måste fyllas i." };

  const existing = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.id, id));
  if (existing.length > 0) {
    return {
      ok: false,
      error: `Det finns redan en annons med id "${id}". Välj ett annat id.`,
    };
  }

  const toInsert: Listing = clean({
    ...listing,
    id,
    city: listing.city.trim(),
  });

  const [row] = await db.insert(listingsTable).values(toInsert).returning();

  revalidatePath("/administrator/innehall");
  return { ok: true, listing: fromRow(row) };
}
