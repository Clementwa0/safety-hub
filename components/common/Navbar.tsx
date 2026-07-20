"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown, FaBars, FaXmark, FaWhatsapp } from "react-icons/fa6";

import Logo from "@/public/logo/logo.png";
import { navLinks, TopStripe } from ".";
// import CartIcon from "../cart/CartIcon";
import { FaCartPlus, FaSearch } from "react-icons/fa";

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
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`fixed inset-x-0 top-0 z-50 border-b border-border/40 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 shadow-2xl backdrop-blur-xl backdrop-saturate-150"
          : "bg-white/90 backdrop-blur-md"
      }`}
    >
      <TopStripe />

      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo with subtle hover effect */}
        <Link
          href="/"
          className="flex items-center transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        >
          <Image
            src={Logo}
            alt="HSE Hub Limited"
            width={170}
            height={50}
            priority
            className="h-auto w-auto"
          />
        </Link>

        {/* Desktop Navigation with improved spacing and visual hierarchy */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
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
                  className={`
                    relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl
                    transition-all duration-300 ease-out
                    ${
                      active
                        ? "text-secondary bg-secondary/10 shadow-sm"
                        : "text-foreground/80 hover:text-secondary hover:bg-secondary/5"
                    }
                    focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:ring-offset-2
                  `}
                >
                  <span className="relative">
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="navbar-active"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-secondary"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </span>

                  {hasDropdown && (
                    <motion.div
                      animate={{ rotate: dropdown === link.label ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="ml-0.5"
                    >
                      <FaChevronDown className="h-3 w-3 opacity-60" />
                    </motion.div>
                  )}
                </Link>

                <AnimatePresence mode="wait">
                  {hasDropdown && dropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute left-1/2 top-full w-[480px] -translate-x-1/2 pt-2"
                    >
                      <div className="rounded-2xl border border-border/50 bg-white/95 p-2 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
                        <div className="grid grid-cols-2 gap-1">
                          {link.dropdown?.map((item, index) => {
                            const Icon = item.icon;
                            return (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                              >
                                <Link
                                  href={item.href}
                                  className="group flex items-start gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-secondary/5 hover:shadow-sm"
                                >
                                  {Icon && (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 text-secondary transition-all duration-300 group-hover:scale-110 group-hover:bg-secondary group-hover:text-white group-hover:shadow-lg">
                                      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-semibold leading-tight group-hover:text-secondary transition-colors duration-300">
                                      {item.label}
                                    </h4>
                                    {item.description && (
                                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/80 line-clamp-2">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>

                        <Link
                          href={link.href}
                          className="mt-2 flex justify-center rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 py-3 text-sm font-semibold text-primary transition-all duration-300 hover:from-primary/10 hover:to-secondary/10 hover:shadow-sm"
                        >
                          View all {link.label} →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Right Actions with improved visual hierarchy */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/60 transition-all duration-300 hover:bg-secondary/10 hover:text-secondary hover:shadow-sm"
          >
            <FaSearch className="h-4.5 w-4.5" />
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <FaCartPlus className="h-5 w-5 text-foreground/60 transition-colors duration-300 hover:text-secondary cursor-pointer" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shadow-sm">
              0
            </span>
          </motion.div>

          <motion.a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-95"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaWhatsapp size={18} />
            <span>Order via WhatsApp</span>
          </motion.a>

          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/60 transition-all duration-300 hover:bg-secondary/10 hover:text-secondary lg:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <FaXmark
                size={22}
                className="rotate-90 transition-transform duration-300"
              />
            ) : (
              <FaBars size={22} className="transition-transform duration-300" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu with improved animations and spacing */}
      <AnimatePresence mode="wait">
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden border-t border-border/40 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container mx-auto max-h-[calc(100vh-8rem)] overflow-y-auto px-4 py-4">
              {navLinks.map((link, index) => {
                const hasDropdown = !!link.dropdown;
                const opened = mobileDropdown === link.label;
                const active = isActive(link.href);

                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/30 last:border-none"
                  >
                    <div className="flex items-center justify-between py-3">
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`
                          text-sm font-medium transition-all duration-300
                          ${
                            active
                              ? "text-secondary"
                              : "text-foreground/80 hover:text-secondary"
                          }
                          px-2 py-1 rounded-lg hover:bg-secondary/5
                        `}
                      >
                        {link.label}
                      </Link>

                      {hasDropdown && (
                        <motion.button
                          onClick={() =>
                            setMobileDropdown(opened ? null : link.label)
                          }
                          className="p-2 rounded-lg hover:bg-secondary/5 transition-colors duration-300"
                          whileTap={{ scale: 0.95 }}
                          aria-label={`Toggle ${link.label} submenu`}
                        >
                          <FaChevronDown
                            className={`h-4 w-4 text-foreground/60 transition-all duration-300 ${
                              opened ? "rotate-180" : ""
                            }`}
                          />
                        </motion.button>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {opened && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 pb-3 pl-4">
                            {link.dropdown?.map((item, idx) => (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                              >
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/80 transition-all duration-300 hover:bg-secondary/5 hover:text-secondary hover:pl-4"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  {item.icon && (
                                    <item.icon className="h-4 w-4 text-secondary/60" />
                                  )}
                                  <span>{item.label}</span>
                                </Link>
                                {item.description && (
                                  <p className="px-3 pb-1 text-xs text-muted-foreground/60">
                                    {item.description}
                                  </p>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              <motion.a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-95"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen(false)}
              >
                <FaWhatsapp size={18} />
                Order via WhatsApp
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
