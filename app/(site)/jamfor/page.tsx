import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import CompareEmpty from "@/components/compare/CompareEmpty";
import CompareTable, { type CompareProduct } from "@/components/compare/CompareTable";
import { getBuildSettings } from "@/lib/build/settings";
import { parseCompareIds } from "@/lib/compare";
import { getListingsByIds } from "@/lib/listings/queries";
import { listingHref } from "@/lib/listings/saved";

export const metadata: Metadata = { title: "Jämför attefallshus | BOFAST" };

// Prices and specs come from the database and change from the admin panel.
export const dynamic = "force-dynamic";

/**
 * Side-by-side comparison of up to four houses, picked with the "Jämför"
 * toggles. The URL (?ids=a,b,c) is the source of truth, so a comparison can
 * be bookmarked or shared.
 */
export default async function JamforPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const ids = parseCompareIds((await searchParams).ids);
  const [compared, { municipalities }] = await Promise.all([
    getListingsByIds(ids),
    getBuildSettings(),
  ]);

  const products: CompareProduct[] = compared.map(({ listing, listingType }) => ({
    listing,
    typeLabel:
      listingType === "attefallshus" ? "Attefallshus" : "Attefallshus med källare",
    href: listingHref(listingType, listing.id),
  }));

  return (
    <>
      <PageHeader
        title="Jämför attefallshus"
        subtitle="Pris, pris per kubikmeter och alla specifikationer sida vid sida."
      />
      <Container className="py-10 md:py-12">
        {products.length >= 2 ? (
          <CompareTable products={products} municipalities={municipalities} />
        ) : (
          <CompareEmpty foundIds={products.map((p) => p.listing.id)} />
        )}
      </Container>
    </>
  );
}
