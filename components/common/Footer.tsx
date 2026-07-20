"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaShieldAlt,
  FaChevronDown,
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import {
  categories,
  contactInfo,
  containerVariants,
  itemVariants,
  legalLinks,
  quickLinks,
  socialLinks,
} from ".";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Show only 3 categories on mobile, all on desktop
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 3);
  const hasMoreCategories = categories.length > 3;

  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6"
      >
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <FaShieldAlt className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">HSE Hub</span>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70">
              Certified PPE and industrial safety equipment for sites, factories and field teams across East Africa.
            </p>
            <div className="mt-5 flex gap-3">
              {[FaFacebook, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              {quickLinks.slice(0, 4).map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Categories</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              {displayedCategories.map((category) => (
                <li key={category.label}>
                  <Link
                    href={category.href}
                    className="hover:text-accent transition-colors duration-200"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
              {hasMoreCategories && (
                <li>
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="flex items-center gap-1.5 text-sm text-accent hover:text-accent/80 transition-colors duration-200 font-medium"
                  >
                    {showAllCategories ? "Show Less" : "View All Categories"}
                    <FaChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        showAllCategories ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </li>
              )}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/70">
              {contactInfo.map((item) => {
                const Icon = item.icon;

                if (item.href) {
                  return (
                    <li key={item.value} className="flex items-start gap-2">
                      <Icon className="mt-0.5 h-4 w-4 text-accent" />
                      <a
                        href={item.href}
                        className="hover:text-accent transition-colors duration-200"
                      >
                        {item.value}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={item.value} className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 text-accent" />
                    <span>{item.value}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-10 border-t border-white/10 pt-6 text-xs text-primary-foreground/60"
        >
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p>© {currentYear} HSE Hub Limited. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-accent transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}