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
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-lg shadow-black/5" : "shadow-sm"
      }`}
    >
      <TopStripe />
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105 duration-300">
          <Image src={Logo} alt={COMPANY.name} width={170} priority className="h-auto" />
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav
          categoryItems={categoryItems}
          dropdown={dropdown}
          setDropdown={setDropdown}
          isActive={isActive}
        />

        {/* Right Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search Button with Keyboard Shortcut */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className="group relative flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground lg:px-4"
          >
            <FaSearch className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60 lg:inline">
              ⌘K
            </kbd>
          </button>

          <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />

          <CartIcon />

          <div className="hidden lg:flex">
            <AccountMenu />
          </div>

          {/* WhatsApp Button with "Order Now" Badge */}
          <Link
            href={`https://wa.me/${COMPANY.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative hidden items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 md:flex"
          >
            <FaWhatsapp size={18} className="relative z-10 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative z-10">Order Now</span>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
            
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-muted hover:scale-105 lg:hidden"
          >
            <FaBars size={22} className="text-foreground" />
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