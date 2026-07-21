"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa6";

import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  title: string;
  section: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
  icon?: React.ReactNode;
  className?: string;
}

export default function SectionWrapper({
  title,
  section,
  isExpanded,
  onToggle,
  children,
  count,
  icon,
  className,
}: SectionWrapperProps) {
  const contentId = `${section}-content`;
  const headingId = `${section}-heading`;

  return (
    <section
      className={cn(
        "border-b border-border last:border-b-0",
        className
      )}
    >
      <button
        id={headingId}
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-muted-foreground">
              {icon}
            </span>
          )}

          <span className="text-sm font-semibold">
            {title}
          </span>

          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {count}
            </span>
          )}
        </div>

        <motion.div
          animate={{
            rotate: isExpanded ? 180 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          <FaChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={contentId}
            role="region"
            aria-labelledby={headingId}
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}