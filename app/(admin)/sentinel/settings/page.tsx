import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import SettingsPage from "@/features/sentinel/settings/SettingsPage";

export default async function Page() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/sentinel/dashboard");
  }

  return <SettingsPage />;
}
