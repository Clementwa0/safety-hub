"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaCommentDots,
  FaPhoneVolume,
  FaShieldHalved,
} from "react-icons/fa6";
import { COMPANY } from "@/lib/constants";

export default function CTA() {
  return (
    <section id="cta" className="py-6 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-primary shadow-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

          {/* ================= MOBILE ================= */}
          <div className="relative flex flex-col items-center px-5 py-8 text-center lg:hidden">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              <FaShieldHalved className="text-secondary" />
              Certified PPE
            </div>

            <h2 className="mt-4 text-2xl font-bold leading-tight text-white">
              Protect Your Workforce
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
              Quality PPE, competitive pricing and fast nationwide delivery.
            </p>

            <div className="mt-6 flex w-full flex-col gap-3">
              <a
                href={`https://wa.me/${COMPANY.whatsapp}`}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold text-white"
              >
                <FaCommentDots />
                WhatsApp Us
              </a>

              <a
                href={`tel:${COMPANY.phone}`}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white"
              >
                <FaPhoneVolume />
                Call Now
              </a>
            </div>
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="relative hidden items-center gap-10 p-10 lg:grid lg:grid-cols-[1.5fr_1fr]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                <FaShieldHalved className="text-secondary" />
                Trusted PPE Supplier
              </div>

              <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white">
                Protect Your Workforce With
                <span className="block text-secondary">
                  Certified Safety Equipment
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
                Quality PPE for construction, manufacturing, healthcare,
                education and industrial workplaces with nationwide delivery.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  "Certified PPE",
                  "Bulk Discounts",
                  "Nationwide Delivery",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://wa.me/${COMPANY.whatsapp}`}
                  className="flex h-11 items-center gap-2 rounded-xl bg-secondary px-6 text-sm font-semibold text-white"
                >
                  <FaCommentDots />
                  WhatsApp Us
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`tel:${COMPANY.phone}`}
                  className="flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white"
                >
                  <FaPhoneVolume />
                  Call Now
                </motion.a>
              </div>

              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
              >
                Browse Products
                <FaArrowRight />
              </Link>
            </div>

            <div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Why Choose Us
                </h3>

                <div className="mt-5 space-y-4">
                  {[
                    ["Certified PPE", "KEBS & ISO Standards"],
                    ["Fast Delivery", "Nationwide Coverage"],
                    ["Bulk Discounts", "Save up to 25%"],
                  ].map(([title, value]) => (
                    <div
                      key={title}
                      className="border-b border-white/10 pb-3 last:border-none"
                    >
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-sm text-white/70">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-secondary p-5 text-center">
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="mt-1 text-sm text-white/90">
                    Safety Products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}