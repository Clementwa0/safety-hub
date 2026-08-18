import { Suspense } from "react";
import CheckoutSuccessPage from "@/features/storefront/checkout/success/CheckoutSuccessPage";
import { Loading } from "@/components/shared/Loading";

export default function Page() {
  return (
    <Suspense
      fallback={
        <Loading
          label="Confirming your order..."
          className="py-24"
        />
      }
    >
      <CheckoutSuccessPage />
    </Suspense>
  );
}