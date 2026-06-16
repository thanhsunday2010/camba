import { HomeHero } from "@/components/home/home-hero";
import { HomeMainContent } from "@/components/home/home-main-content";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <HomeMainContent />
    </div>
  );
}
