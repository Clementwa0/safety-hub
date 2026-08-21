"use client"
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaCommentDots,
  FaShieldHalved,
  FaTruck,
  FaStar,
} from "react-icons/fa6";

import heroImg from "@/public/images/hero.png";
import { useSettings } from "@/components/SettingsProvider";

const features = [
  {
    icon: FaShieldHalved,
    label: "Certified PPE",
  },
  {
    icon: FaTruck,
    label: "Nationwide Delivery",
  },
  {
    icon: FaStar,
    label: "Trusted Quality",
  },
];

export default function Hero() {
  const { settings } = useSettings();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-slate-50"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImg}
          alt="Industrial Safety Equipment"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40 lg:from-white lg:via-white/90 lg:to-transparent" />

        {/* Bottom Fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          {/* Small Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary"
          >
            <FaShieldHalved className="h-3.5 w-3.5" />
            Safety Equipment
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-primary sm:text-5xl lg:text-6xl"
          >
            Safety Gear You Can{" "}
            <span className="text-secondary">Trust.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base"
          >
            Shop certified PPE and workplace safety equipment for every
            industry. Quality products, competitive prices, delivered
            nationwide.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-secondary" />
                  {feature.label}
                </div>
              );
            })}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-7 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-lg"
            >
              Shop PPE
              <FaArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <FaCommentDots className="h-4 w-4 text-secondary" />
              WhatsApp Us
            </Link>
          </motion.div>

          {/* Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span className="flex gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className="h-3 w-3 text-yellow-400"
                  />
                ))}
              </span>
              Quality Products
            </span>

            <span className="h-1 w-1 rounded-full bg-green-500" />

            <span>Corporate Orders</span>

            <span className="h-1 w-1 rounded-full bg-green-500" />

            <span>Nationwide Delivery</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}