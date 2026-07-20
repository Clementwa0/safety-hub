import { Footer, Navbar } from "@/components/common";
import type { ReactNode } from "react";

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

      {/*<WhatsAppFab /> */}
    </>
  );
}