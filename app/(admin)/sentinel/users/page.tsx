import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import UsersPage from "@/features/sentinel/users/UsersPage";

export default async function Page() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/sentinel/dashboard");
  }

  return <UsersPage />;
}
