"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaBars, FaWhatsapp} from "react-icons/fa6";

import Logo from "@/public/logo.png";
import { TopStripe } from "..";
import { COMPANY } from "@/lib/constants";
import { categoryService } from "@/services/shared/category.service";
import SearchOverlay from "../SearchOverlay";
import type { DropdownItem } from "..";
import DesktopNav from "./DesktopNav";
import MobileNavDrawer from "./MobileNav";
import { FaSearch } from "react-icons/fa";
import CartIcon from "@/features/storefront/cart/components/CartIcon";
import AccountMenu from "@/features/storefront/account/components/AccountMenu";

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [categoryItems, setCategoryItems] = useState<DropdownItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }

      if (event.key === "Escape") {
        setDropdown(null);
        setMobileDropdown(null);
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const items = await categoryService.list();

        if (cancelled) return;

        setCategoryItems(
          items
            .filter((item) => item.name && item.slug)
            .map((item) => ({
              label: item.name,
              href: `/categories/${item.slug}`,
              description: item.description,
            }))
        );
      } catch (error) {
        console.error("Failed to load navigation categories:", error);

        if (!cancelled) {
          setCategoryItems([]);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setDropdown(null);
    setMobileDropdown(null);
    setMenuOpen(false);
  }, [pathname]);

  const SHOP_ALIAS_PATHS = [
    "/shop",
    "/new-arrivals",
    "/featured",
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/shop") {
      return SHOP_ALIAS_PATHS.some(
        (path) =>
          pathname === path ||
          pathname.startsWith(`${path}/`)
      );
    }

    if (href.length > 1) {
      return (
        pathname === href ||
        pathname.startsWith(`${href}/`)
      );
    }

    return pathname === href;
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={`fixed inset-x-0 top-0  z-50 border-b border-border/50 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled
          ? "shadow-lg shadow-black/5"
          : "shadow-sm"
      }`}
    >
      {/* TOP STRIPE */}
      <TopStripe />

      {/* MAIN NAVBAR */}
      <div className="border-t border-border/30">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-5 px-6 sm:px-6 lg:px-10">
          <Link
            href="/"
            aria-label={`${COMPANY.name} home`}
            className="group flex shrink-0 items-center"
          >
            <Image
              src={Logo}
              alt={`${COMPANY.name} logo`}
              width={130}
              height={20}
              priority
              className="h-auto w-[135px] object-contain transition-transform duration-200 group-hover:scale-[1.02] sm:w-[150px] lg:w-[160px]"
            />
          </Link>

          <div className="hidden min-w-0 flex-1 lg:flex lg:justify-center">
            <DesktopNav
              categoryItems={categoryItems}
              dropdown={dropdown}
              setDropdown={setDropdown}
              isActive={isActive}
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="group flex h-10 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground sm:px-3 lg:px-4"
            >
              <FaSearch className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />

              <span className="hidden lg:inline">
                Search
              </span>

              <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 lg:inline">
                Ctrl K
              </kbd>
            </button>

            <SearchOverlay
              open={searchOpen}
              onOpenChange={setSearchOpen}
            />

            <CartIcon />

            <div className="hidden lg:flex">
              <AccountMenu />
            </div>

            <Link
              href={`https://wa.me/${COMPANY.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Text to order on WhatsApp"
              className="group relative hidden items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-green-500/30 xl:flex"
            >
              <FaWhatsapp
                size={18}
                className="relative z-10 transition-transform duration-300 group-hover:scale-110"
              />

              <span className="relative z-10 whitespace-nowrap">
                Text to Order
              </span>

              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all hover:scale-105 hover:bg-muted lg:hidden"
            >
              <FaBars
                size={21}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        categoryItems={categoryItems}
        mobileDropdown={mobileDropdown}
        setMobileDropdown={setMobileDropdown}
        isActive={isActive}
      />
    </motion.header>
  );
}