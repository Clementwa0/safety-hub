"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { 
  FaChevronDown, 
  FaBars, 
  FaXmark,
  FaWhatsapp
} from "react-icons/fa6";

import Logo from "@/public/logo/logo.png";
import { navLinks, TopStripe } from ".";
import CartIcon from "../cart/CartIcon";
import { FaSearch } from "react-icons/fa";
import { COMPANY } from "@/lib/constants";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to check if a link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    // Check if the current path starts with the href
    // But only if the href is not just a single slash
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
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const hasDropdown = !!link.dropdown;
            const active = isActive(link.href);

            return (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => hasDropdown && setDropdown(link.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-1 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-secondary"
                      : "text-foreground hover:text-secondary"
                  }`}
                >
                  {link.label}

                  {hasDropdown && (
                    <FaChevronDown
                      className={`h-4 w-4 transition-transform ${
                        dropdown === link.label ? "rotate-180" : ""
                      }`}
                    />
                  )}

                  {active && (
                    <motion.span
                      layoutId="navbar-active"
                      className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-secondary"
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {hasDropdown && dropdown === link.label && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="absolute left-1/2 top-full w-[420px] -translate-x-1/2"
                    >
                      <div className="mt-3 rounded-xl border bg-white p-2 shadow-2xl">
                        {link.dropdown?.map((item) => {
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="group flex gap-3 rounded-xl p-3 transition hover:bg-secondary/5"
                            >
                              {Icon && (
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition group-hover:bg-secondary group-hover:text-white">
                                  <Icon className="h-5 w-5" />
                                </div>
                              )}

                              <div>
                                <h4 className="text-sm font-semibold">
                                  {item.label}
                                </h4>

                                {item.description && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          );
                        })}

                        <Link
                          href={link.href}
                          className="mt-3 flex justify-center rounded-xl bg-primary/5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
                        >
                          View all {link.label}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted">
            <FaSearch className="h-5 w-5 text-primary" />
          </button>

          <CartIcon />

          <Link
            href={`https://wa.me/${COMPANY.whatsapp}`}
            className="hidden md:flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <FaWhatsapp size={18} />
            Order via WhatsApp
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted lg:hidden"
          >
            {menuOpen ? <FaXmark size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="overflow-hidden border-t bg-white lg:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              {navLinks.map((link) => {
                const hasDropdown = !!link.dropdown;
                const opened = mobileDropdown === link.label;
                const active = isActive(link.href);

                return (
                  <div key={link.label} className="border-b last:border-none">
                    <div className="flex items-center justify-between py-3">
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`font-medium ${
                          active ? "text-secondary" : ""
                        }`}
                      >
                        {link.label}
                      </Link>

                      {hasDropdown && (
                        <button
                          onClick={() =>
                            setMobileDropdown(opened ? null : link.label)
                          }
                        >
                          <FaChevronDown
                            className={`transition ${
                              opened ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {opened && (
                        <motion.div
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          className="overflow-hidden pl-4"
                        >
                          {link.dropdown?.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="block py-2 text-sm text-muted-foreground"
                              onClick={() => setMenuOpen(false)}
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

              <Link
                href={`https://wa.me/${COMPANY.whatsapp}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-white"
              >
                <FaWhatsapp size={18} />
                Order via WhatsApp
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}