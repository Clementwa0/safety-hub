import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import CartDrawer from "@/components/cart/CartDrawer";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "HSE Hub Limited",
    template: "%s | HSE Hub Limited",
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
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body>
        {children}
        <CartDrawer />
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
