import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * Gives every listing that has no product information yet the placeholder
 * specs from lib/db/placeholder-specs.ts, so no product page shows empty
 * panels. Listings where anything has already been filled in (documents,
 * measurements or any spec section) keep their specs, and listings with
 * purchase packages keep those, so running this again never overwrites real
 * data.
 */
async function main() {
  const { db } = await import("../lib/db/client");
  const { listings } = await import("../lib/db/schema");
  const { PLACEHOLDER_SPECS } = await import("../lib/db/placeholder-specs");
  const { ALL_SPEC_SECTIONS } = await import("../lib/listings/spec-sections");
  const { eq } = await import("drizzle-orm");

  const { packages, ...specs } = PLACEHOLDER_SPECS;
  const rows = await db.select().from(listings);
  let filledSpecs = 0;
  let filledPackages = 0;

  for (const row of rows) {
    const needsSpecs =
      row.documents.length === 0 &&
      row.length == null &&
      ALL_SPEC_SECTIONS.every(({ key }) => row[key].length === 0);
    // Packages are checked on their own: a listing can have real specs but
    // no purchase options yet (they were added later).
    const needsPackages = row.packages.length === 0;
    if (!needsSpecs && !needsPackages) continue;

    await db
      .update(listings)
      .set({
        ...(needsSpecs ? specs : {}),
        ...(needsPackages ? { packages } : {}),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, row.id));
    if (needsSpecs) filledSpecs += 1;
    if (needsPackages) filledPackages += 1;
  }

  console.log(
    `${rows.length} listings: filled specs on ${filledSpecs}, packages on ${filledPackages}.`
  );

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
