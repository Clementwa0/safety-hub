import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import CartDrawer from "@/components/cart/CartDrawer";
import { CustomerSessionProvider } from "@/components/providers/CustomerSessionProvider";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: COMPANY.name,
    template: `%s | ${COMPANY.name}`,
  },
  description:
    "Leading supplier of PPE, industrial safety equipment and workplace protection solutions in Kenya.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <body>
        <CustomerSessionProvider>
          {children}
          <CartDrawer />
        </CustomerSessionProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand
          theme="light"
        />{" "}
      </body>
    </html>
  );
}
