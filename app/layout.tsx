import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { getSettings } from "@/lib/settings/get-settings.server";
import { SettingsProvider } from "@/components/SettingsProvider";
import CartDrawer from "@/features/storefront/cart/components/CartDrawer";
import { CustomerSessionProvider } from "@/components/CustomerSessionProvider";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: {
      default: settings.companyName,
      template: `%s | ${settings.companyName}`,
    },
    description:
      "Leading supplier of PPE, industrial safety equipment and workplace protection solutions in Kenya.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="en" className={cn("font-sans")}>
      <body>
        <SettingsProvider initialSettings={settings}>
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
        </SettingsProvider>
      </body>
    </html>
  );
}
