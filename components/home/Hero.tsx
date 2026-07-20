"use client";

import { motion } from "framer-motion";
import { FaArrowRight, FaCommentDots, FaShieldHalved, FaTruck, FaStar } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import heroImg from "@/public/images/hero.png";

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const features = [
    { icon: FaShieldHalved, label: "Certified PPE" },
    { icon: FaTruck, label: "Nationwide Delivery" },
    { icon: FaStar, label: "Trusted Partner" },
  ];

  return (
    <section
      id="home"
      className="relative pt-14 min-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImg}
          alt="Industrial Safety Equipment"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70 sm:from-white/90 sm:via-white/80 sm:to-white/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent sm:hidden" />
      </div>

      <div className="relative z-10 container mx-auto flex min-h-[90vh] items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12">
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
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-secondary"
            >
              <FaShieldHalved className="h-3.5 w-3.5" />
              Safety Solutions
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
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
              className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              Certified PPE and industrial safety equipment for construction,
              manufacturing, healthcare, and every industry that values safety.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-6 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white/80 px-2.5 py-2 shadow-sm"
                  >
                    <Icon className="h-4 w-4 text-secondary shrink-0" />
                    <span className="text-[10px] font-medium text-gray-700 sm:text-xs">
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
              className="mt-6 flex flex-col gap-2.5 sm:flex-row"
            >
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-secondary/90 hover:shadow-lg"
              >
                Shop Now
                <FaArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="https://wa.me/254115062024"
                target="_blank"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition hover:shadow-md"
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
              className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground lg:justify-start"
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

          {/* Right Side - Empty for image background */}
          <div className="order-1 hidden lg:block lg:order-2" />
        </div>
      </div>

      {/* Scroll Indicator */}
      {!isMobile && (
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground sm:flex">
          <span>Scroll</span>
          <div className="flex h-5 w-3.5 justify-center rounded-full border border-muted-foreground/30">
            <div className="mt-1 h-1.5 w-0.5 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      )}
    </section>
  );
}