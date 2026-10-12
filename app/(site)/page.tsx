import Hero from "@/components/home/Hero";
import ActionLinks from "@/components/home/ActionLinks";
import NewsSection from "@/components/home/NewsSection";
import FeatureSection from "@/components/home/FeatureSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ActionLinks />
      <NewsSection />
      <FeatureSection />
    </>
  );
}
