import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import ApartmentCard from "@/components/apartments/ApartmentCard";
import { getAttefallshusMedKallare } from "@/lib/listings/queries";
import { getSaveContext } from "@/lib/listings/saved";

export const metadata: Metadata = { title: "Attefallshus med källare | BOFAST" };

// See the note in ../attefallshus/page.tsx on dynamic vs. cached.
export const dynamic = "force-dynamic";

export default async function AttefallshusMedKallarePage() {
  const [listings, { authed, savedIds }] = await Promise.all([
    getAttefallshusMedKallare(),
    getSaveContext(),
  ]);

  return (
    <>
      <PageHeader
        title="Attefallshus med källare"
        subtitle="Attefallshus med källare för extra förvaring och boyta."
      />
      <Container className="py-12">
        <p className="mb-6 text-sm text-muted">
          {listings.length} attefallshus med källare
        </p>
        {listings.length === 0 ? (
          <p className="text-sm text-ink">
            Just nu finns inga attefallshus med källare lediga. Välkommen
            tillbaka snart!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <ApartmentCard
                key={listing.id}
                apartment={listing}
                href={`/attefallshus-med-kallare/${listing.id}`}
                typeLabel="Attefallshus med källare"
                saved={savedIds.has(listing.id)}
                authed={authed}
                priority={index === 0}
              />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
