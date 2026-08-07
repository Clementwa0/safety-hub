"use client";

import { FaWhatsapp } from "react-icons/fa";
import { COMPANY } from "@/lib/constants";
import { waLink } from "@/lib/whatsapp";

export default function WhatsAppFab() {
  const href = waLink(
    `Hello ${COMPANY.name}, I'm interested in your safety products. Kindly assist me.`
  );

  return (
    <div className="fixed bottom-8 right-8 z-50 group">
      {/* Pulse Animation Ring */}
      <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-60"></div>
      
      {/* Main Button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-4 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group-hover:shadow-2xl"
      >
        {/* WhatsApp Icon */}
        <FaWhatsapp className="relative z-10 h-8 w-8 text-white" />
        
        {/* "Order Now" Text Overlay - Integrated */}
        <span className="relative z-10 mt-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-90 transition-opacity duration-300 group-hover:opacity-100">
          Order Now
        </span>
        
        {/* Inner Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
      </a>

      {/* Tooltip - Positioned to the left */}
      <div className="pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-xl opacity-0 transition-all duration-300 group-hover:opacity-100">
        Chat with us on WhatsApp
        {/* Tooltip Arrow */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
      </div>
    </div>
  );
}