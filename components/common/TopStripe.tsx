import {
  RiCustomerService2Fill,
  RiMailFill,
  RiPhoneFill,
  RiShieldCheckFill,
  RiTimeFill,
  RiTruckFill,
} from "react-icons/ri";

import { COMPANY } from "@/lib/constants";

const SITE = {
  phone: COMPANY.phone,
  email: COMPANY.email,
};

export default function TopStripe() {
  return (
    <div className="hidden lg:block border-b border-slate-800 bg-slate-900 text-slate-200">
      <div className="container mx-auto flex h-10 items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-6 text-xs">
          <span className="flex items-center gap-1.5">
            <RiShieldCheckFill className="text-sm text-emerald-400" />
            Certified PPE Supplier
          </span>

          <span className="flex items-center gap-1.5">
            <RiTruckFill className="text-sm text-orange-400" />
            Nationwide Delivery
          </span>

          <span className="flex items-center gap-1.5">
            <RiTimeFill className="text-sm text-orange-400" />
            Mon – Fri: 8:00 AM – 5:00 PM
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 text-xs">
          <a
            href={`tel:${SITE.phone}`}
            className="flex items-center gap-1.5 transition-colors hover:text-orange-400"
          >
            <RiPhoneFill className="text-sm" />
            {SITE.phone}
          </a>

          <a
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-1.5 transition-colors hover:text-orange-400"
          >
            <RiMailFill className="text-sm" />
            {SITE.email}
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