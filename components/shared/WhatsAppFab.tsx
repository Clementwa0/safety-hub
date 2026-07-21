"use client";

import { FaWhatsapp } from "react-icons/fa";
import { waLink } from "@/lib/whatsapp";

export default function WhatsAppFab() {
  const href = waLink(
    "Hello HSE Hub Limited, I'm interested in your safety products. Kindly assist me."
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
      >
        {/* Pulse */}
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25" />

        {/* WhatsApp Icon */}
        <FaWhatsapp className="relative z-10 h-8 w-8" />
      </a>

      {/* Tooltip */}
      <div className="pointer-events-none absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-card px-3 py-2 text-sm font-medium shadow-card opacity-0 transition-all duration-300 group-hover:opacity-100">
        Chat with us
      </div>
    </div>
  );
}