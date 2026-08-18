import { Suspense } from "react";
import { Loading } from "@/components/shared/Loading";
import LoginPage from "@/features/sentinel/auth/LoginPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <Loading
          label="Loading..."
          className="py-24"
        />
      }
    >
      <LoginPage />
    </Suspense>
  );
}