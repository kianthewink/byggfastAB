import { config } from "dotenv";
config({ path: ".env.local" });

// Imported dynamically AFTER dotenv runs — static imports are hoisted above
// config(), so the db client would throw "DATABASE_URL is not set".
async function main() {
  const { db } = await import("../lib/db/client");
  const { listings } = await import("../lib/db/schema");
  const { LISTINGS } = await import("../lib/db/seed-data");

  console.log(`Seeding ${LISTINGS.length} listings...`);

  for (const listing of LISTINGS) {
    await db
      .insert(listings)
      .values(listing)
      .onConflictDoUpdate({
        target: listings.id,
        set: { ...listing, updatedAt: new Date() },
      });
  }

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
