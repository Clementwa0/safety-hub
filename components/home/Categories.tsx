"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";

import { CategoryGrid } from "../category";
import { requestQuoteLink } from "../common/storefront";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export default function Categories() {
  const reduceMotion = useReducedMotion();
  const motionEnabled = !reduceMotion;

  return (
    <section
      id="categories"
      className="relative overflow-hidden bg-slate-50 py-10 sm:py-12"
    >
      {/* Subtle Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={motionEnabled ? containerVariants : undefined}
          initial={motionEnabled ? "hidden" : false}
          whileInView={motionEnabled ? "show" : undefined}
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-6"
        >
          <motion.div
            variants={motionEnabled ? itemVariants : undefined}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-primary sm:text-2xl">
                Shop by Category
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Find the safety equipment you need.
              </p>
            </div>

            <Link
              href="/categories"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-secondary"
            >
              See All
              <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Categories */}
          <motion.div variants={motionEnabled ? itemVariants : undefined}>
            <CategoryGrid limit={4} />
          </motion.div>

          {/* Simple CTA */}
          <motion.div
            variants={motionEnabled ? itemVariants : undefined}
            className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row"
          >
            <div>
              <h3 className="font-semibold text-primary">
                Buying in bulk?
              </h3>

              <p className="text-sm text-muted-foreground">
                Get special pricing for large orders.
              </p>
            </div>

            <Link
              href={requestQuoteLink.href}
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-md"
            >
              Request Bulk Quote
              <FaArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
