"use client";

import { PanelLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import Breadcrumbs from "./Breadcrumbs";
import Notifications from "./Notifications";
import MessagesShortcut from "./MessagesShortcut";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header
      className="
        sticky top-0 z-40
        flex h-16 shrink-0 items-center
        justify-between gap-3
        border-b border-border bg-background/95
        px-4 sm:px-6
        backdrop-blur-xl
      "
    >
      {/* Left Section */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        {/* <Notifications /> */}
        <MessagesShortcut />
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
