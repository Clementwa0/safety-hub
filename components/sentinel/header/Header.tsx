"use client";

import { Sidebar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

import HelpButton from "./HelpButton";
import Notifications from "./Notifications";
import MessagesShortcut from "./MessagesShortcut";
import UserMenu from "./UserMenu";

const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky flex justify-between top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur-xl sm:px-6">
      {/* =====================================================
          LEFT: sidebar toggle + search
      ====================================================== */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        <Sidebar className="!h-5 !w-5" strokeWidth={2} aria-hidden="true" />
      </Button>


    <div className="flex shrink-0 items-center  gap-1.5">
        <Notifications />
        <MessagesShortcut />

        <div aria-hidden="true" className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <HelpButton />

        <div aria-hidden="true" className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
