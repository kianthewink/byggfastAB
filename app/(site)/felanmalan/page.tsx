import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Felanmälan | BOFAST" };

export default function FelanmalanPage() {
  return (
    <>
      <PageHeader
        title="Felanmälan"
        subtitle="Här kan du logga in och göra felanmälan på ditt objekt."
      />
      <Container className="py-16">
        <p className="text-sm text-muted">
          Här kommer formuläret för felanmälan.
        </p>
      </Container>
    </>
  );
}
