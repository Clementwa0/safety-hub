"use client";

import { FaWhatsapp, FaRobot, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY } from "@/lib/constants";
import { waLink } from "@/lib/whatsapp";
import { useEffect, useState } from "react";

export default function WhatsAppFab() {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const href = waLink(
    `Hello ${COMPANY.name}, I'm interested in your safety products. Kindly assist me.`
  );

  // Auto-close after 8 seconds
  useEffect(() => {
    if (!isExpanded) return;

    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [isExpanded]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-4 w-72 origin-bottom-right overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200"
          >
            {/* Card header */}
            <div className="flex items-center gap-3 bg-green-600 px-4 py-4 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <FaWhatsapp className="h-6 w-6" />
              </div>

              <div>
                <p className="font-semibold">Chat with us</p>
                <p className="text-xs text-green-100">
                  We respond in minutes
                </p>
              </div>
            </div>

            {/* Card body */}
            <div className="p-4">
              <p className="text-sm text-gray-600">
                👋 Hi there! How can we help you today?
              </p>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => window.open(href, "_blank")}
                  className="flex w-full items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-left text-sm font-medium text-green-700 transition-all hover:bg-green-100"
                >
                  <FaWhatsapp className="h-5 w-5 text-green-600" />
                  <span>Chat on WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    setIsExpanded(false);
                    window.location.href = "/contact";
                  }}
                  className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left text-sm font-medium text-blue-700 transition-all hover:bg-blue-100"
                >
                  <FaRobot className="h-5 w-5 text-blue-600" />
                  <span>Contact Support</span>
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Usually replies in under 5 minutes
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        type="button"
        aria-label={isExpanded ? "Close chat" : "Open WhatsApp chat"}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((prev) => !prev)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/40"
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? (
            <FaTimes className="h-6 w-6 text-white" />
          ) : (
            <FaWhatsapp className="h-7 w-7 text-white" />
          )}
        </motion.div>

        {/* Hover ring effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-green-400"
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: isHovered ? 1.3 : 1,
            opacity: isHovered ? 0.6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Tooltip */}
        {!isExpanded && (
          <div className="pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white opacity-0 shadow-xl transition-all duration-300 group-hover:opacity-100">
            Need help? Chat with us!
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
