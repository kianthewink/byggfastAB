import Link from "next/link";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import ProductGallery from "@/components/listings/ProductGallery";
import ProductSpecsLine from "@/components/listings/ProductSpecsLine";
import ProductInfoPanels from "@/components/listings/ProductInfoPanels";
import ApartmentDetailsTable from "@/components/apartments/ApartmentDetailsTable";
import ViewingsTable from "@/components/apartments/ViewingsTable";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import RatingSummaryLink from "@/components/reviews/RatingSummaryLink";
import BuildProvider from "@/components/build/BuildProvider";
import PurchaseBox from "@/components/build/PurchaseBox";
import BuildOnline from "@/components/build/BuildOnline";
import CompareToggle from "@/components/compare/CompareToggle";
import { getSaveContext } from "@/lib/listings/saved";
import { hasAppliedToListing } from "@/lib/listings/applications";
import { getReviewsForListing } from "@/lib/listings/reviews";
import { getBuildSettings } from "@/lib/build/settings";
import { telHref } from "@/lib/format";
import type { Apartment } from "@/lib/types";

/**
 * The whole product page body, shared by /attefallshus/[id] and
 * /attefallshus-med-kallare/[id] — the two differ only in labels and links.
 */
export default async function ProductDetail({
  listing,
  typeLabel,
  backHref,
  backLabel,
}: {
  listing: Apartment;
  typeLabel: string;
  backHref: string;
  backLabel: string;
}) {
  const [{ authed, savedIds }, alreadyApplied, reviews, { catalog, municipalities }] =
    await Promise.all([
      getSaveContext(),
      hasAppliedToListing(listing.id),
      getReviewsForListing(listing.id),
      getBuildSettings(),
    ]);

  const hasContacts = !!listing.contacts?.length;
  const hasViewings = !!listing.viewings?.length;

  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container className="py-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-brand underline-offset-2 hover:underline"
          >
            <Icon name="chevron-left" size={16} />
            {backLabel}
          </Link>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <BuildProvider
          listingId={listing.id}
          title={`${typeLabel} i ${listing.city}`}
          image={listing.images[0]}
          catalog={catalog}
          packages={listing.packages}
          municipalities={municipalities}
          initialApplied={alreadyApplied}
        >
          {/* Gallery left; the purchase box (Välj kommun …) beside it, where
              the map used to be. */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10">
            <ProductGallery
              images={listing.images}
              alt={listing.city}
              listingId={listing.id}
              saved={savedIds.has(listing.id)}
              authed={authed}
              titleSlot={
                <div>
                  <h1 className="text-lg text-brand md:text-xl">{listing.city}</h1>
                  <div className="mt-1">
                    <RatingSummaryLink reviews={reviews} />
                  </div>
                  <div className="mt-3">
                    <ProductSpecsLine listing={listing} />
                  </div>
                  <CompareToggle
                    className="mt-4"
                    item={{
                      id: listing.id,
                      title: `${typeLabel} i ${listing.city}`,
                      image: listing.images[0],
                    }}
                  />
                </div>
              }
            />

            <div>
              <PurchaseBox initialApplied={alreadyApplied} authed={authed} />
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10">
            <div className="space-y-6">
              <ApartmentDetailsTable apartment={listing} typeLabel={typeLabel} />

              <ProductInfoPanels
                documents={listing.documents}
                specs={listing.specs}
              />

              {listing.description && (
                <div className="rounded-md bg-surface-3 p-6 text-sm leading-relaxed whitespace-pre-line text-ink">
                  {listing.description}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {hasViewings && <ViewingsTable viewings={listing.viewings!} />}

              {hasContacts && (
                <div className="rounded-md border border-line bg-white p-6 shadow-sm">
                  <h2 className="text-lg text-brand">Prata med våra husexperter</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink">
                    Har du frågor om huset, kommunen eller bygglovet? Ring oss
                    så hjälper vi dig.
                  </p>

                  <address className="mt-4 space-y-2 text-sm not-italic text-ink">
                    {listing.contacts!.map((contact) => (
                      <p key={contact.phone} className="flex items-center gap-2">
                        <Icon name="phone" size={15} className="shrink-0 text-brand" />
                        <a href={telHref(contact.phone)} className="hover:text-brand">
                          {contact.name}, {contact.phone}
                        </a>
                      </p>
                    ))}
                  </address>
                </div>
              )}
            </div>
          </div>

          <ReviewsSection reviews={reviews} />

          <BuildOnline initialApplied={alreadyApplied} authed={authed} />
        </BuildProvider>
      </Container>
    </>
  );
}
