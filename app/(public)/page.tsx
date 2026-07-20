import {
  Hero,
  Categories,
  FeaturedProducts,
  CTA,
  Stats,
} from "@/components/home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      {/* <Stats /> */}
      <CTA />
    </>
  );
}
