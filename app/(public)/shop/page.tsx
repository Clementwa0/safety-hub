import { Suspense } from "react";
import ShopPage from "@/components/shop/ShopPage";
import ShopPageSkeleton from "@/components/shop/ShopPageSkeleton";

export default function ShopRoute() {
  // useShopFilters reads/writes the URL via useSearchParams, which Next.js
  // requires to sit inside a Suspense boundary so this route can still be
  // prerendered instead of forcing the whole app to opt out of static
  // rendering.
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopPage />
    </Suspense>
  );
}
