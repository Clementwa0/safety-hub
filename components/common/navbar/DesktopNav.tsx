"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa6";
import { DropdownItem, navLinks } from "..";

interface DesktopNavProps {
  categoryItems: DropdownItem[];
  dropdown: string | null;
  setDropdown: (value: string | null) => void;
  isActive: (href: string) => boolean;
}

export default function DesktopNav({
  categoryItems,
  dropdown,
  setDropdown,
  isActive,
}: DesktopNavProps) {
  return (
    <nav className="hidden lg:flex items-center gap-8">
      {navLinks.map((link) => {
        const linkDropdown =
          link.label === "Categories" ? categoryItems : link.dropdown;
        const hasDropdown = !!linkDropdown && linkDropdown.length > 0;
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full z-50 mt-3 w-[640px] -translate-x-1/2"
                >
                  <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-2xl">
                    <div className="grid grid-cols-2 gap-1">
                      {linkDropdown?.map((item) => {
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="group flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-secondary/5"
                          >
                            {Icon && (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-all duration-200 group-hover:bg-secondary group-hover:text-white">
                                <Icon className="h-5 w-5" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-foreground transition-colors group-hover:text-secondary">
                                {item.label}
                              </h4>

                              {item.description && (
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="mt-4 border-t pt-4">
                      <Link
                        href={link.href}
                        className="flex items-center justify-center rounded-xl bg-primary/5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
                      >
                        View all {link.label}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}