import { Loading } from "@/components/shared/Loading";
import Login from "@/features/storefront/account/Login";
import { Suspense } from "react";

export default function AccountOverviewRoute() {
  return (
  <Suspense
        fallback={
          <Loading
            label="Confirming your order..."
            className="py-24"
          />
        }
      >
  <Login />
  </Suspense>
  );
}
