"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown, FaUser, FaWhatsapp } from "react-icons/fa6";
import { useSession } from "next-auth/react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useSettings } from "@/components/SettingsProvider";
import { DropdownItem, navLinks } from "..";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryItems: DropdownItem[];
  mobileDropdown: string | null;
  setMobileDropdown: (value: string | null) => void;
  isActive: (href: string) => boolean;
}

export default function MobileNavDrawer({
  open,
  onOpenChange,
  categoryItems,
  mobileDropdown,
  setMobileDropdown,
  isActive,
}: MobileNavDrawerProps) {
  const { data: session, status } = useSession();
  const { settings } = useSettings();

  const close = () => {
    setMobileDropdown(null);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setMobileDropdown(null);
    }
  }, [open, setMobileDropdown]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[88%] max-w-sm flex-col p-0 sm:w-[380px]"
      >
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="text-base font-bold text-primary">
            Site Menu
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Account */}
          <Link
            href={
              status === "authenticated"
                ? "/account/orders"
                : "/account/sign-in"
            }
            onClick={close}
            className="flex items-center gap-3 border-b px-5 py-4 transition-colors hover:bg-muted/50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FaUser className="h-4 w-4" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {status === "authenticated"
                  ? session?.user?.name ?? "My Account"
                  : "Sign in / Register"}
              </p>

              {status === "authenticated" && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  View your account
                </p>
              )}
            </div>
          </Link>

          {/* Navigation */}
          <nav aria-label="Mobile navigation" className="px-5">
            {navLinks.map((link) => {
              const linkDropdown =
                link.label === "Categories"
                  ? categoryItems
                  : link.dropdown;

              const hasDropdown =
                !!linkDropdown && linkDropdown.length > 0;

              const opened = mobileDropdown === link.label;
              const active = isActive(link.href);

              return (
                <div
                  key={link.label}
                  className="border-b border-border/70 last:border-b-0"
                >
                  <div className="flex min-h-12 items-center justify-between">
                    <Link
                      href={link.href}
                      onClick={close}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "font-semibold text-secondary"
                          : "text-foreground hover:text-secondary"
                      }`}
                    >
                      {link.label}
                    </Link>

                    {hasDropdown && (
                      <button
                        type="button"
                        aria-label={`Toggle ${link.label} submenu`}
                        aria-expanded={opened}
                        onClick={() =>
                          setMobileDropdown(
                            opened ? null : link.label
                          )
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <FaChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            opened ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {opened && hasDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeOut",
                        }}
                        className="overflow-hidden"
                      >
                        <div className="mb-2 ml-2 border-l border-secondary/20 pl-3">
                          {linkDropdown?.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={close}
                              className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/5 hover:text-secondary"
                            >
                              <span className="font-medium">
                                {item.label}
                              </span>

                              {item.description && (
                                <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground/70">
                                  {item.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* WhatsApp CTA */}
        <div className="border-t bg-background p-4">
          <Link
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md"
          >
            <FaWhatsapp
              className="h-5 w-5"
              aria-hidden="true"
            />

            Order via WhatsApp
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}