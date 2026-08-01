"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaCommentDots,
  FaShieldHalved,
} from "react-icons/fa6";

import { COMPANY } from "@/lib/constants";

export default function CTA() {
  return (
    <section id="cta" className="bg-slate-50 py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-primary px-5 py-8 shadow-lg sm:px-8 lg:px-10"
        >
          {/* Decorative Background */}
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-secondary/10 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-white/5 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                <FaShieldHalved className="text-secondary" />
                Certified Safety Equipment
              </div>

              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                Need PPE for Your Business?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                Shop quality safety equipment or contact us for bulk orders
                and special pricing.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-lg"
              >
                Shop Now
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href={`https://wa.me/${COMPANY.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
              >
                <FaCommentDots className="text-secondary" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}