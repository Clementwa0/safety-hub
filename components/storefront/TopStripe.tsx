"use client";

import {
  RiCustomerService2Fill,
  RiMailFill,
  RiPhoneFill,
  RiTimeFill,
  RiTruckFill,
} from "react-icons/ri";

import { useSettings } from "@/components/SettingsProvider";
import { corporateLink } from "./links";

export default function TopStripe() {
  const { settings } = useSettings();

  return (
    <div className="hidden border-b border-border/40 bg-primary text-white md:block">
      <div className="mx-auto flex h-9 w-full max-w-[1440px] items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <span className="font-medium">
            Certified PPE Supplier
          </span>

          <span className="flex items-center gap-1.5">
            <RiTruckFill className="text-sm text-orange-400" />
            Nationwide Delivery
          </span>

          <span className="flex items-center gap-1.5">
            <RiTimeFill className="text-sm text-orange-400" />
            {settings.businessHours || "Mon – Fri: 8:00 AM – 5:00 PM"}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={`tel:${settings.contactPhone}`}
            className="flex items-center gap-1.5 transition-colors hover:text-orange-400"
          >
            <RiPhoneFill className="text-sm" />
            {settings.contactPhone}
          </a>

          <a
            href={`mailto:${settings.contactEmail}`}
            className="flex items-center gap-1.5 transition-colors hover:text-orange-400"
          >
            <RiMailFill className="text-sm" />
            {settings.contactEmail}
          </a>

          <a
            href={corporateLink.href}
            className="flex items-center gap-1.5 transition-colors hover:text-orange-400"
          >
            {corporateLink.label}
          </a>

          <a
            href="/contact"
            className="flex items-center gap-1.5 font-medium text-orange-400 transition-colors hover:text-orange-300"
          >
            <RiCustomerService2Fill className="text-sm" />
            Support
          </a>
        </div>
      </div>
    </div>
  );
}
