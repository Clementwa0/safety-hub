import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/sentinel/header";
import Sidebar from "@/components/sentinel/sidebar/Sidebar";
import { requireStaff } from "@/lib/auth";

export default async function SentinelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireStaff();

  if (!user) {
    redirect("/sentinel/login");
  }

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <Sidebar />

      <SidebarInset className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}