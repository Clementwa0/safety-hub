"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown, FaUser, FaWhatsapp } from "react-icons/fa6";

import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Logo from "@/public/logo.png";
import { COMPANY } from "@/lib/constants";
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
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-full max-w-[340px] flex-col p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="sr-only">Site menu</SheetTitle>
          <Image src={Logo} alt={COMPANY.name} width={130} />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {/* Account row */}
          <Link
            href={status === "authenticated" ? "/account/orders" : "/account/sign-in"}
            onClick={close}
            className="flex items-center gap-3 border-b py-4"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FaUser className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              {status === "authenticated" ? (session?.user?.name ?? "My Account") : "Sign in / Register"}
            </span>
          </Link>

          {navLinks.map((link) => {
            const linkDropdown =
              link.label === "Categories" ? categoryItems : link.dropdown;
            const hasDropdown = !!linkDropdown && linkDropdown.length > 0;
            const opened = mobileDropdown === link.label;
            const active = isActive(link.href);

            return (
              <div key={link.label} className="border-b last:border-none">
                <div className="flex items-center justify-between py-3">
                  <Link
                    href={link.href}
                    onClick={close}
                    className={`font-medium ${active ? "text-secondary" : ""}`}
                  >
                    {link.label}
                  </Link>

                  {hasDropdown && (
                    <button
                      type="button"
                      aria-label={`Toggle ${link.label} submenu`}
                      onClick={() => setMobileDropdown(opened ? null : link.label)}
                      className="flex h-8 w-8 items-center justify-center"
                    >
                      <FaChevronDown className={`transition ${opened ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {opened && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-4"
                    >
                      {linkDropdown?.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block py-2 text-sm text-muted-foreground"
                          onClick={close}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="border-t p-5">
          <Link
            href={`https://wa.me/${COMPANY.whatsapp}`}
            onClick={close}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-white"
          >
            <FaWhatsapp size={18} />
            Order via WhatsApp
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}