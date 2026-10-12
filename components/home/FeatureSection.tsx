import Container from "@/components/ui/Container";
import FeatureCardItem from "@/components/home/FeatureCardItem";
import { features } from "@/data/features";

/** The three feature cards near the bottom of the home page. */
export default function FeatureSection() {
  return (
    <section className="py-12">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((card) => (
            <FeatureCardItem key={card.id} card={card} />
          ))}
        </div>
      </Container>
    </section>
  );
}
