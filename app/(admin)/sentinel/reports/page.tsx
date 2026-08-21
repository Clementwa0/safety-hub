import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import ReportsPage from "@/features/sentinel/reports/ReportsPage";

export const metadata = { title: "Reports — Sentinel" };

export default async function Page() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/sentinel/dashboard");
  }

  return <ReportsPage />;
}
