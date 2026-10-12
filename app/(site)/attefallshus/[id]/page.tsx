import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/listings/ProductDetail";
import { getAttefallshusById } from "@/lib/listings/queries";

interface AttefallshusPageProps {
  params: Promise<{ id: string }>;
}

// Listings come from the database, so pages are rendered on demand rather
// than enumerated at build time with generateStaticParams().
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: AttefallshusPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getAttefallshusById(id);

  if (!listing) {
    return { title: "Attefallshuset hittades inte | BOFAST" };
  }

  return { title: `Attefallshus i ${listing.city} | BOFAST` };
}

export default async function AttefallshusDetailPage({ params }: AttefallshusPageProps) {
  const { id } = await params;
  const listing = await getAttefallshusById(id);

  if (!listing) {
    notFound();
  }

  return (
    <ProductDetail
      listing={listing}
      typeLabel="Attefallshus"
      backHref="/attefallshus"
      backLabel="Alla attefallshus"
    />
  );
}
