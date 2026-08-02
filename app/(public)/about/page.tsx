"use client";

import { motion } from "framer-motion";
import { FaShieldHalved, FaTruck, FaUsers, FaAward, FaArrowRight, FaCircleCheck } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: FaShieldHalved,
    title: "Certified Products",
    description:
      "We supply certified PPE and industrial safety equipment that meet recognised quality and workplace safety standards.",
  },
  {
    icon: FaTruck,
    title: "Fast Delivery",
    description:
      "Reliable and timely delivery across Nairobi and nationwide for businesses, institutions and contractors.",
  },
  {
    icon: FaUsers,
    title: "Trusted Partner",
    description:
      "Serving construction companies, manufacturers, healthcare facilities, schools and government institutions.",
  },
  {
    icon: FaAward,
    title: "Expert Support",
    description:
      "Our experienced team helps you select the right safety solutions for every work environment.",
  },
];

const values = [
  "High-Quality Safety Products",
  "Customer Satisfaction",
  "Reliable & Fast Delivery",
  "Competitive Pricing",
  "Professional Customer Support",
  "Long-Term Business Partnerships",
];

export default function AboutPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-24">
        <div className="container mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
              About HSE Hub Limited
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight text-primary md:text-6xl">
              Your Trusted Partner in
              <br />
              Health, Safety & Environment
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground">
              HSE Hub Limited is a trusted supplier of high-quality Personal
              Protective Equipment (PPE) and industrial safety products in
              Kenya. We are committed to protecting workers by providing
              certified safety equipment for construction, manufacturing,
              healthcare, education, hospitality, logistics, and other
              industries.
            </p>

            <p className="mx-auto mt-6 max-w-3xl leading-8 text-muted-foreground">
              From safety helmets and reflective jackets to respiratory
              protection, safety footwear and first aid equipment, we deliver
              reliable solutions that help organizations maintain safer,
              compliant and more productive workplaces.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg">
                View Products
                <FaArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                >
                  <Card className="h-full border shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-lift">
                    <CardContent className="p-7">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                        <Icon className="h-7 w-7 text-secondary" />
                      </div>

                      <h3 className="mt-6 text-xl font-semibold text-primary">
                        {feature.title}
                      </h3>

                      <p className="mt-3 leading-7 text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-muted/40 py-24">
        <div className="container mx-auto grid gap-16 px-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-primary">
              Our Mission
            </h2>

            <p className="mt-6 leading-8 text-muted-foreground">
              To provide dependable, affordable and certified workplace safety
              equipment that protects lives, promotes compliance and enables
              businesses to create safer working environments.
            </p>

            <p className="mt-5 leading-8 text-muted-foreground">
              We strive to build lasting relationships with our clients by
              delivering quality products, exceptional customer service and
              timely delivery.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-primary">
              Why Choose HSE Hub Limited?
            </h2>

            <div className="mt-8 space-y-5">
              {values.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3"
                >
                  <FaCircleCheck className="mt-1 h-5 w-5 text-secondary" />

                  <span className="leading-7 text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-primary px-8 py-16 text-center text-white md:px-16"
          >
            <h2 className="text-3xl font-bold md:text-4xl">
              Ready to Improve Workplace Safety?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
              Whether you need PPE for a small team or bulk safety supplies for
              a large organization, HSE Hub Limited is ready to serve you with
              quality products and professional support.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
              >
                Browse Products
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white hover:text-primary"
              >
                Contact Our Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}