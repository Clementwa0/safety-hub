import { Suspense } from "react";

import Login from "@/features/storefront/account/Login";

export default function AccountOverviewRoute() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
