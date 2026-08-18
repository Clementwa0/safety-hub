import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/constants";
import CartDrawer from "@/features/storefront/cart/components/CartDrawer";
import { CustomerSessionProvider } from "@/components/CustomerSessionProvider";

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