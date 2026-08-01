"use client";

import { motion } from "framer-motion";

import { contactCards, fadeUp } from "./contact-data";

export default function ContactInfoCards() {
  return (
    <section className="relative mt-5 z-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            staggerChildren: 0.12,
          }}
          className="grid gap-6 rounded-3xl bg-background p-6 shadow-2xl md:grid-cols-2 lg:grid-cols-4"
        >
          {contactCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <div
                  className={`flex h-full gap-5 ${
                    index !== contactCards.length - 1
                      ? "lg:border-r lg:border-border lg:pr-6"
                      : ""
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center  justify-center rounded-2xl ${card.iconBg} text-white shadow-lg`}
                  >
                   <Icon className="h-5 w-5"/>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-primary">
                      {card.title}
                    </h3>

                    <div className="mt-3 space-y-1">
                      {card.lines.map((line) => (
                        <p
                          key={line}
                          className="text-sm leading-6 text-muted-foreground"
                        >
                          {line}
                        </p>
                      ))}
                    </div>

                    <p className="mt-4 text-xs font-medium text-secondary">
                      {card.sub}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
