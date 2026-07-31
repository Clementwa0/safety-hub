"use client";

import type { ReactNode } from "react";
import Header from "@/components/sentinel/header/Header";
import Sidebar from "@/components/sentinel/sidebar/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-screen">
      <Sidebar />
      <SidebarInset className="flex min-h-screen min-w-0 flex-1 flex-col bg-background">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
