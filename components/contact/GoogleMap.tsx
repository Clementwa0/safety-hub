"use client";

import { motion } from "framer-motion";
import { FaArrowRight, FaMapPin } from "react-icons/fa6";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import ContactForm from "./ContactForm";
import { COMPANY } from "@/lib/constants";

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(COMPANY.address)}&output=embed`;

export default function GoogleMap() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden rounded-3xl border shadow-lg">
        <CardContent className="relative p-0">
          {/* Google Map */}
          <iframe
            title="HSE Hub Location"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[320px] w-full border-0 sm:h-[420px] lg:h-[500px]"
          />

          {/* Desktop Floating Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="absolute bottom-6 left-6 hidden lg:block"
          >
            <Card className="w-80 border-0 shadow-2xl">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <FaMapPin className="h-6 w-6 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-primary">
                      Visit Our Store
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      HSE Hub Limited
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground leading-6">
                  <p>{COMPANY.address}</p>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full">
                    Get Directions
                    <FaArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </CardContent>
      </Card>

      {/* Mobile Card */}
      <Card className="mt-5 border shadow-sm lg:hidden">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FaMapPin className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold text-lg text-primary">
                Visit Our Store
              </h3>

              <p className="text-sm text-muted-foreground">
                HSE Hub Limited
              </p>
            </div>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground leading-6">
            <p>{COMPANY.address}</p>
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full">
              Get Directions
              <FaArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FormAndMap() {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <ContactForm />
          <GoogleMap />
        </div>
      </div>
    </section>
  );
}