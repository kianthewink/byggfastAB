import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import ApartmentCard from "@/components/apartments/ApartmentCard";
import { getAttefallshus } from "@/lib/listings/queries";
import { getSaveContext } from "@/lib/listings/saved";

export const metadata: Metadata = {
  title: "Attefallshus | BOFAST",
};

// Rendered per request so a change published in /administrator/innehall
// shows up immediately. To trade instant updates for cached pages, swap this for
// `export const revalidate = 300` and call revalidatePath() from the admin
// actions in app/(admin)/administrator/(dashboard)/innehall/actions.ts.
export const dynamic = "force-dynamic";

export default async function AttefallshusPage() {
  const [listings, { authed, savedIds }] = await Promise.all([
    getAttefallshus(),
    getSaveContext(),
  ]);

  return (
    <>
      <PageHeader
        title="Attefallshus"
        subtitle="Titta på våra attefallshus och hitta ditt nästa hem."
      />
      <Container className="py-12">
        <p className="mb-6 text-sm text-muted">
          {listings.length} attefallshus
        </p>
        {listings.length === 0 ? (
          <p className="text-sm text-ink">
            Just nu finns inga attefallshus lediga. Välkommen tillbaka snart!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <ApartmentCard
                key={listing.id}
                apartment={listing}
                href={`/attefallshus/${listing.id}`}
                typeLabel="Attefallshus"
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
