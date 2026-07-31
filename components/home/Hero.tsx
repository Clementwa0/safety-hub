"use client";

import { motion } from "framer-motion";
import { FaArrowRight, FaCommentDots, FaShieldHalved, FaTruck, FaStar } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";

import heroImg from "@/public/images/hero.png";
import { COMPANY } from "@/lib/constants";

// Combined mask so the hero image fades on the left (into the copy/background)
// and softly at the top and bottom, instead of ending in a hard rectangular
// crop. Two gradients are intersected via mask-composite so all three edges
// fade at once; the -webkit- fallback uses the classic "source-in, source-in"
// chain for Safari versions that don't support `mask-composite: intersect`.
const IMAGE_FADE_MASK = {
  maskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 18%, black 38%, black 100%), linear-gradient(to bottom, black 82%, transparent 100%), linear-gradient(to top, black 88%, transparent 100%)",
  maskComposite: "intersect" as const,
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 18%, black 38%, black 100%), linear-gradient(to bottom, black 82%, transparent 100%), linear-gradient(to top, black 88%, transparent 100%)",
  WebkitMaskComposite: "source-in, source-in",
};

export default function Hero() {
  const features = [
    { icon: FaShieldHalved, label: "Certified PPE" },
    { icon: FaTruck, label: "Nationwide Delivery" },
    { icon: FaStar, label: "Trusted Partner" },
  ];

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-14"
    >
      {/* Background image, faded on the left + top/bottom so it blends into
          the section background rather than reading as a hard-cropped photo. */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={IMAGE_FADE_MASK}>
          <Image
            src={heroImg}
            alt="Industrial Safety Equipment"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        {/* Light scrim so body text keeps sufficient contrast over the photo
            on narrower screens where the image and copy overlap vertically. */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40 sm:from-white/90 sm:via-white/75 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent lg:hidden" />
      </div>

      <div className="relative z-10 container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="order-2 text-center lg:order-1 lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-secondary"
            >
              <FaShieldHalved className="h-3.5 w-3.5" />
              Safety Solutions
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="text-primary">Protect Your</span>
              <br />
              <span className="text-primary">Workforce.</span>
              <span className="block bg-gradient-to-r from-secondary to-yellow-500 bg-clip-text text-transparent">
                Stay Compliant.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0"
            >
              Certified PPE and industrial safety equipment for construction,
              manufacturing, healthcare, and every industry that values safety.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mx-auto mt-7 grid max-w-lg grid-cols-2 gap-2.5 sm:grid-cols-3 lg:mx-0"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-secondary" />
                    <span className="text-[11px] font-medium text-gray-700 sm:text-xs">
                      {feature.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-secondary/90 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:py-3"
              >
                Shop Now
                <FaArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href={`https://wa.me/${COMPANY.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:py-3"
              >
                <FaCommentDots className="h-4 w-4 text-secondary" />
                WhatsApp Us
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground lg:justify-start"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-700">Top Quality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>Corporate Orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>Nationwide Delivery</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side intentionally empty — the background image fills this
              area on large screens where content and photo sit side by side. */}
          <div className="order-1 hidden lg:order-2 lg:block" />
        </div>
      </div>

      {/* Scroll indicator — CSS handles visibility (hidden below sm), so no
          JS resize listener/state is needed to toggle it. */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:flex">
        <span>Scroll</span>
        <div className="flex h-5 w-3.5 justify-center rounded-full border border-muted-foreground/30">
          <div className="mt-1 h-1.5 w-0.5 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
}