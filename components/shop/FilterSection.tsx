"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FilterSectionProps {
  /** Header label, e.g. "Categories". */
  title: string;
  /** Number of active filters in this section; renders a badge when > 0. */
  count?: number;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Controlled open state (pair with `onOpenChange`). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reusable, accessible accordion shell for one sidebar section.
 * Animation is pure CSS (grid-template-rows) so it works without JS layout
 * measurement and respects `prefers-reduced-motion`.
 */
export function FilterSection({
  title,
  count = 0,
  defaultOpen = true,
  open,
  onOpenChange,
  className,
  children,
}: FilterSectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const panelId = useId();
  const headerId = `${panelId}-header`;

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card/60 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-border",
        className,
      )}
    >
      <h3>
        <button
          id={headerId}
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center gap-2 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex-1 truncate">{title}</span>
          {count > 0 && (
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground"
              aria-label={`${count} active`}
            >
              {count}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isOpen}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
