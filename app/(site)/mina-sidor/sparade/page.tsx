import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import SavedListingCard from "@/components/account/SavedListingCard";
import { requireUser } from "@/lib/auth/user-dal";
import { getSavedListings } from "@/lib/listings/saved";

export const metadata: Metadata = { title: "Sparade objekt | BOFAST" };

export default async function SparadePage() {
  // Sends signed-out visitors to the login page.
  await requireUser();
  const saved = await getSavedListings();

  return (
    <>
      <PageHeader
        title="Sparade objekt"
        subtitle="Attefallshus du har sparat med hjärtat."
      />
      <Container className="py-12 md:py-16">
        <Link
          href="/mina-sidor"
          className="inline-flex items-center gap-1.5 text-sm text-brand underline-offset-2 hover:underline"
        >
          <Icon name="arrow-left" size={16} />
          Tillbaka till Mina sidor
        </Link>

        {saved.length === 0 ? (
          <div className="mt-8 rounded-md border border-line bg-surface-3 p-8 text-center">
            <Icon
              name="heart"
              size={28}
              className="mx-auto text-brand"
              aria-hidden
            />
            <h2 className="mt-4 text-base text-brand">Inget sparat ännu</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Klicka på hjärtat på ett attefallshus så hamnar det här, så att
              du enkelt hittar tillbaka.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/attefallshus">Attefallshus</Button>
              <Button href="/attefallshus-med-kallare">
                Attefallshus med källare
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-muted">
              {saved.length === 1
                ? "1 sparat objekt"
                : `${saved.length} sparade objekt`}
            </p>
            <ul className="mt-4 space-y-4">
              {saved.map((item) => (
                <li key={item.apartment.id}>
                  <SavedListingCard item={item} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </>
  );
}
