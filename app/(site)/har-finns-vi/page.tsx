import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Här finns vi | BOFAST" };

export default function HarFinnsViPage() {
  return (
    <>
      <PageHeader
        title="Här finns vi"
        subtitle="BOFAST har attefallshus i ett 30-tal orter i västra Sverige."
      />
      <Container className="py-16">
        <p className="text-sm text-muted">
          Här kan en karta och en lista över orter visas.
        </p>
      </Container>
    </>
  );
}
