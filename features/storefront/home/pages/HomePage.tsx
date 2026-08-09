import { Hero, Categories, FeaturedProducts, NewArrivals, CTA } from "@/components/home";

export default function HomePage() {
  return (
    <>
    <Categories />
      <Hero />
      <FeaturedProducts />
      <NewArrivals />
      <CTA />
    </>
  );
}
