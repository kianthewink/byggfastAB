import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/listings/ProductDetail";
import { getAttefallshusMedKallareById } from "@/lib/listings/queries";

interface AttefallshusKallarePageProps {
  params: Promise<{ id: string }>;
}

// See the note in ../../attefallshus/[id]/page.tsx.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: AttefallshusKallarePageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getAttefallshusMedKallareById(id);

  if (!listing) {
    return { title: "Attefallshuset hittades inte | BOFAST" };
  }

  return { title: `Attefallshus med källare i ${listing.city} | BOFAST` };
}

export default async function AttefallshusKallareDetailPage({ params }: AttefallshusKallarePageProps) {
  const { id } = await params;
  const listing = await getAttefallshusMedKallareById(id);

  if (!listing) {
    notFound();
  }

  return (
    <ProductDetail
      listing={listing}
      typeLabel="Attefallshus med källare"
      backHref="/attefallshus-med-kallare"
      backLabel="Alla attefallshus med källare"
    />
  );
}
