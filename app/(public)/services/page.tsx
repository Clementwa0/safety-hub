import Link from "next/link";
import { FaShieldHalved, FaTruck, FaHeadphones, FaCircleCheck } from "react-icons/fa6";

const services = [
  {
    title: "PPE Supply",
    description: "Reliable sourcing of helmets, gloves, goggles, respirators, and other essential protective gear.",
    icon: FaShieldHalved,
  },
  {
    title: "Technical Support",
    description: "Guidance on compliance, fitting, maintenance, and safe use of workplace safety equipment.",
    icon: FaHeadphones,
  },
  {
    title: "Fast Delivery",
    description: "Prompt delivery across Kenya with flexible logistics support for bulk procurement needs.",
    icon: FaTruck,
  },
  {
    title: "Quality Assurance",
    description: "Certified, durable products backed by dependable after-sales support and documentation.",
    icon: FaCircleCheck,
  },
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-3xl rounded-3xl border border-border bg-card/70 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold text-foreground">Our Services</h1>
        <p className="mt-3 text-muted-foreground">
          HSE Hub helps businesses stay compliant and protected with dependable PPE sourcing, support, and delivery.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">{service.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-secondary/10 p-4 text-sm text-secondary">
          Need a custom quotation? <Link href="/contact" className="font-semibold underline">Contact our team</Link>
        </div>
      </div>
    </div>
  );
}