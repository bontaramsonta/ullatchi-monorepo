import { Hero } from "@/components/hero";
import { FeatureCards } from "@/components/feature-cards";
import { FeaturedStories } from "@/components/featured-stories";
import { CTASection } from "@/components/cta-section";

export function HomePage() {
  return (
    <div>
      <Hero />
      <FeatureCards />
      <FeaturedStories />
      <CTASection />
    </div>
  );
}
