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
    <nav className="hidden lg:flex items-center gap-7">
      {navLinks.map((link) => {
        const isCategories = link.label === "Categories";

        const linkDropdown = isCategories
          ? categoryItems
          : link.dropdown ?? [];

        const hasDropdown = linkDropdown.length > 0;
        const isOpen = dropdown === link.label;
        const active = isActive(link.href);

        return (
          <div
            key={link.label}
            className="relative"
            onMouseEnter={() => {
              if (hasDropdown) {
                setDropdown(link.label);
              }
            }}
            onMouseLeave={() => {
              if (hasDropdown) {
                setDropdown(null);
              }
            }}
          >
            {/* Navigation Link */}
            <Link
              href={link.href}
              aria-haspopup={hasDropdown ? "menu" : undefined}
              aria-expanded={hasDropdown ? isOpen : undefined}
              className={`relative flex items-center gap-1.5 py-3 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "text-secondary"
                  : "text-foreground hover:text-secondary"
              }`}
            >
              <span>{link.label}</span>

              {hasDropdown && (
                <FaChevronDown
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
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

            {/* Dropdown */}
            <AnimatePresence>
              {hasDropdown && isOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                  }}
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  className={`absolute top-full z-50 pt-2 ${
                    isCategories
                      ? "left-1/2 w-[760px] -translate-x-1/2"
                      : "left-1/2 w-[250px] -translate-x-1/2"
                  }`}
                  role="menu"
                >
                  <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
                    {isCategories ? (
                      <div className="p-4">
                        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                          <div>
                            <h3 className="text-base font-bold text-foreground">
                              PPE & Safety Equipment
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Shop certified safety equipment by category
                            </p>
                          </div>

                          <Link
                            href="/categories"
                            onClick={() => setDropdown(null)}
                            className="text-xs font-semibold text-secondary transition-colors hover:text-secondary/80"
                          >
                            View all categories →
                          </Link>
                        </div>

                        <div className="grid max-h-[480px] grid-cols-3 gap-2 overflow-y-auto pr-1">
                          {linkDropdown.map((item) => {
                            const Icon = item.icon;

                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                role="menuitem"
                                onClick={() => setDropdown(null)}
                                className="group flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-secondary/5"
                              >
                                {Icon ? (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-all duration-200 group-hover:bg-secondary group-hover:text-white">
                                    <Icon className="h-5 w-5" />
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-all duration-200 group-hover:bg-secondary group-hover:text-white">
                                    <span className="text-sm font-bold">
                                      {item.label.charAt(0)}
                                    </span>
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <h4 className="text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-secondary">
                                    {item.label}
                                  </h4>

                                  {item.description && (
                                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-4 border-t border-border pt-3">
                          <Link
                            href="/categories"
                            onClick={() => setDropdown(null)}
                            className="flex items-center justify-center rounded-xl bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10"
                          >
                            Browse All PPE & Safety Categories
                          </Link>
                        </div>
                      </div>
                    ) : (
                      /* SHOP DROPDOWN */
                      <div className="p-3 ">
                        <div className="grid grid-cols-1 gap-1">
                          {linkDropdown.map((item) => {
                            const Icon = item.icon;

                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                role="menuitem"
                                onClick={() => setDropdown(null)}
                                className="group flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-secondary/5"
                              >
                                {Icon && (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-all duration-200 group-hover:bg-secondary group-hover:text-white">
                                    <Icon className="h-5 w-5" />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <h4 className="text-sm font-semibold text-foreground transition-colors group-hover:text-secondary">
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
                        </div>

                        <div className="mt-2 border-t border-border pt-3">
                          <Link
                            href={link.href}
                            onClick={() => setDropdown(null)}
                            className="flex items-center justify-center rounded-xl bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                          >
                            View All Products →
                          </Link>
                        </div>
                      </div>
                    )}
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
