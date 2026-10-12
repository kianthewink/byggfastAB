import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Om oss | BOFAST" };

export default function OmOssPage() {
  return (
    <>
      <PageHeader
        title="Om oss"
        subtitle="BOFAST är ett privatägt fastighetsbolag som säljer attefallshus i västra Sverige."
      />
      <Container className="py-16">
        <p className="max-w-2xl text-sm leading-relaxed text-ink">
          Bofast är ett privatägt fastighetsbolag som säljer attefallshus i
          ett 30-tal orter i västra Sverige. Vi erbjuder attefallshus i
          skiftande miljöer, både lantligt och i större tätorter.
        </p>
      </Container>
    </>
  );
}
