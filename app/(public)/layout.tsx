import type { ReactNode } from "react";
import { Navbar, Footer } from "@/components/common";
import WhatsAppFab from "@/components/shared/WhatsAppFab";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        {children}
      </main>

      <Footer />

      <WhatsAppFab />
    </>
  );
}