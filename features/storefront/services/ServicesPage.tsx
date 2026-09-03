"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaBoxesStacked,
  FaBuilding,
  FaClipboardCheck,
  FaCommentDots,
  FaFileInvoiceDollar,
  FaHandshake,
  FaHeadset,
  FaTruckFast,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CTA } from "@/features/storefront/home/components";
import { useSettings } from "@/components/SettingsProvider";
import { corporateLink, requestQuoteLink } from "@/components/storefront";

const coreServices = [
  {
    icon: FaBoxesStacked,
    title: "PPE Supply & Distribution",
    description:
      "Head-to-toe personal protective equipment sourced and stocked across every category, from helmets and eyewear to safety footwear and respiratory protection.",
  },
  {
    icon: FaBuilding,
    title: "Corporate & Bulk Orders",
    description:
      "Volume pricing and a dedicated account contact for construction firms, manufacturers, institutions and government bodies ordering at scale.",
  },
  {
    icon: FaFileInvoiceDollar,
    title: "Custom Quotations & Procurement",
    description:
      "Tailored quotations for tenders, contracts and recurring supply agreements, prepared quickly so procurement timelines stay on track.",
  },
  {
    icon: FaTruckFast,
    title: "Nationwide Delivery",
    description:
      "Reliable dispatch across Nairobi and all 47 counties, with delivery timelines communicated up front for every order.",
  },
  {
    icon: FaClipboardCheck,
    title: "Safety Needs Assessment",
    description:
      "Free consultation with our team to match the right PPE to your site's specific hazards, industry standards and workforce size.",
  },
  {
    icon: FaHeadset,
    title: "After-Sales & Restocking Support",
    description:
      "Ongoing support, replacements and scheduled restocking so your organization stays compliant without last-minute shortages.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Consult",
    description: "Tell us about your industry, team size and safety requirements.",
  },
  {
    step: "02",
    title: "Quote",
    description: "We prepare a tailored quotation with the right products and pricing.",
  },
  {
    step: "03",
    title: "Order",
    description: "Confirm your order and payment through your preferred method.",
  },
  {
    step: "04",
    title: "Deliver",
    description: "Your PPE is dispatched and delivered to your site, on schedule.",
  },
  {
    step: "05",
    title: "Support",
    description: "We stay on hand for reorders, replacements and ongoing compliance.",
  },
];

const industries = [
  "Construction",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Hospitality",
  "Logistics",
  "Government",
  "Oil & Gas",
];

export default function ServicesPage() {
  const { settings } = useSettings();

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
              What We Offer
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight text-primary md:text-6xl">
              More Than Products -
              <br />
              Complete Safety Solutions
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-muted-foreground">
              Beyond supplying certified PPE, {settings.companyName} works alongside
              construction companies, manufacturers, healthcare facilities and
              institutions to keep every workplace equipped, compliant and
              protected.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href={requestQuoteLink.href}>
                <Button size="lg">
                  {requestQuoteLink.label}
                  <FaArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/shop">
                <Button variant="outline" size="lg">
                  Browse Products
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Services */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-primary">Our Services</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Everything you need to keep your workforce safe, from sourcing
              to delivery and beyond.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {coreServices.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: (index % 3) * 0.1,
                  }}
                >
                  <Card className="h-full border shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-lift">
                    <CardContent className="p-7">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                        <Icon className="h-7 w-7 text-secondary" />
                      </div>

                      <h3 className="mt-6 text-xl font-semibold text-primary">
                        {service.title}
                      </h3>

                      <p className="mt-3 leading-7 text-muted-foreground">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-muted/40 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-primary">How It Works</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              A straightforward process from first enquiry to ongoing supply.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative"
              >
                <span className="text-4xl font-bold text-secondary/20">
                  {item.step}
                </span>

                <h3 className="mt-3 text-lg font-semibold text-primary">
                  {item.title}
                </h3>

                <p className="mt-2 leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-primary">
                Industries We Serve
              </h2>

              <p className="mt-6 leading-8 text-muted-foreground">
                We supply and support organizations of every size, from
                single-site contractors to multi-branch institutions, across
                a wide range of sectors.
              </p>

              <p className="mt-5 leading-8 text-muted-foreground">
                Not sure which PPE applies to your industry? Our team can
                walk you through what&apos;s required for your specific
                work environment.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={corporateLink.href}>
                  <Button size="lg">
                    <FaHandshake className="mr-2 h-4 w-4" />
                    {corporateLink.label}
                  </Button>
                </Link>

                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    <FaCommentDots className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3"
            >
              {industries.map((industry) => (
                <div
                  key={industry}
                  className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-6 text-center text-sm font-semibold text-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-md"
                >
                  {industry}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reuse the storefront-wide CTA for a consistent close */}
      <CTA />
    </main>
  );
}
