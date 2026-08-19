"use client";

import { useState, type ReactNode } from "react";
import { PanelLeft } from "lucide-react";

import { AccountSidebarContent } from "@/features/storefront/account/components/AccountSidebar"
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <aside className="hidden w-[248px] shrink-0 lg:block">
        <div className="sticky top-24">
          <AccountSidebarContent />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mb-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger >
              <Button variant="outline" className="gap-2 rounded-xl">
                <PanelLeft className="size-4" />
                Account menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Account navigation</SheetTitle>
              <AccountSidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {children}
      </main>
    </div>
  );
}