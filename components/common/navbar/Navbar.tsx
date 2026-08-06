"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaBars, FaWhatsapp } from "react-icons/fa6";

import Logo from "@/public/logo/logo.png";
import { TopStripe } from "..";
import CartIcon from "../../cart/CartIcon";
import AccountMenu from "../../account/AccountMenu";
import { FaSearch } from "react-icons/fa";
import { COMPANY } from "@/lib/constants";
import { categoryService } from "@/services/category.service";
import SearchOverlay from "../SearchOverlay";
import type { DropdownItem } from "..";
import DesktopNav from "./DesktopNav";
import MobileNavDrawer from "./MobileNav";

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
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void categoryService.list().then((items) => {
      if (!cancelled) {
        setCategoryItems(items.map((item) => ({
          label: item.name,
          href: `/categories/${item.slug}`,
          description: item.description,
        })));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href.length > 1) {
      return pathname.startsWith(href);
    }
    return pathname === href;
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed inset-x-0 top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <TopStripe />
      <div className="container mx-auto flex h-15 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src={Logo} alt={COMPANY.name} width={170} priority />
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav
          categoryItems={categoryItems}
          dropdown={dropdown}
          setDropdown={setDropdown}
          isActive={isActive}
        />

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
          >
            <FaSearch className="h-5 w-5 text-primary" />
          </button>

          <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />

          <CartIcon />

          <div className="hidden lg:flex">
            <AccountMenu />
          </div>

          <Link
            href={`https://wa.me/${COMPANY.whatsapp}`}
            className="hidden md:flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <FaWhatsapp size={18} />
            Order via WhatsApp
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted lg:hidden"
          >
            <FaBars size={22} />
          </button>
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