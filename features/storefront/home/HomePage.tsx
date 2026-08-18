import { getProductsByFlag } from "@/lib/server/catalog";
import { Categories, Hero, FeaturedProducts, NewArrivals, CTA } from "./components";

export default async function HomePage() {
  const [featuredProducts, newArrivalProducts] = await Promise.all([
    getProductsByFlag("featured", "active"),
    getProductsByFlag("isNewArrival", "active"),
  ]);

  return (
    <>
    <Categories />
      <Hero />
      <FeaturedProducts products={featuredProducts} />
      <NewArrivals products={newArrivalProducts} />
      <CTA />
    </>
  );
}
