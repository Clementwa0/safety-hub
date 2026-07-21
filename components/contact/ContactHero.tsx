"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaPhone, FaCommentDots } from "react-icons/fa6";

import heroImg from "@/public/images/contact-hero.png";
import { Button } from "@/components/ui/button";

export default function ContactHero() {
  return (
    <section className="bg-white py-4 lg:py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-lg shadow-slate-200/50">

          <div className="relative h-[260px] sm:h-[300px] lg:h-[340px]">
            <Image
              src={heroImg}
              alt="Contact HSE Hub"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />

            <div className="absolute inset-0 bg-slate-900/75" />

            <div className="absolute inset-0 flex items-center">
              <div className="max-w-xl px-5 sm:px-8">

                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-400"
                >
                  Contact HSE Hub
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl"
                >
                  Let&apos;s Help You Find
                  <span className="block text-emerald-400">
                    The Right Safety Equipment
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base"
                >
                  Speak with our PPE specialists for product advice, quotations,
                  bulk orders and nationwide delivery.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-5 flex flex-wrap gap-2"
                >
                  <a href="tel:+254787894925">
                    <Button
                      size="sm"
                      className="h-10 rounded-lg bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-100 active:scale-[0.98]"
                    >
                      <FaPhone className="mr-1.5 h-3.5 w-3.5" />
                      Call Us
                    </Button>
                  </a>

                  <a
                    href="https://wa.me/254787894925"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      className="h-10 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98]"
                    >
                      <FaCommentDots className="mr-1.5 h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                  </a>
                </motion.div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}