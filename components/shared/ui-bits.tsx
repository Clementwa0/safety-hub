"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronRight, FaStar } from "react-icons/fa6";

/* =========================================================
   SECTION HEADER
========================================================= */

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  showDivider?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  showDivider = true,
  className = "",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={`max-w-3xl ${
        centered ? "mx-auto text-center" : "text-left"
      } ${className}`}
    >
      {/* Eyebrow */}
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-secondary ring-1 ring-secondary/20">
            <FaStar className="h-2.5 w-2.5 fill-secondary/30" />
            {eyebrow}
          </span>
        </motion.div>
      )}

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
        className={`${
          eyebrow ? "mt-3" : ""
        } text-2xl font-extrabold leading-tight tracking-tight text-primary sm:text-3xl lg:text-4xl`}
      >
        {title}
      </motion.h2>

      {/* Divider */}
      {showDivider && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 56, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className={`mt-3 h-1 rounded-full bg-gradient-to-r from-secondary to-secondary/50 ${
            centered ? "mx-auto" : ""
          }`}
        />
      )}

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
          className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* =========================================================
   COUNTER
========================================================= */

interface CounterProps {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function Counter({
  to,
  suffix = "",
  prefix = "",
  duration = 1600,
  className = "",
}: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-80px",
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let frame: number;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);

      // Smooth ease-out
      const eased = 1 - Math.pow(1 - progress, 4);

      setCount(Math.round(to * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [isInView, duration, to]);

  return (
    <div
      ref={ref}
      className={`inline-flex items-baseline ${className}`}
    >
      {prefix && (
        <span className="mr-1 text-sm font-medium text-muted-foreground">
          {prefix}
        </span>
      )}

      <motion.span
        initial={{ scale: 0.85, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl"
      >
        {count.toLocaleString()}
      </motion.span>

      {suffix && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   BREADCRUMB
========================================================= */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export function Breadcrumb({
  items,
  className = "",
  separator,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`w-full ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <motion.li
              key={`${item.label}-${index}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.06,
                duration: 0.25,
              }}
              className="flex items-center gap-1"
            >
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="group flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary sm:text-sm"
                >
                  {item.icon && (
                    <span className="opacity-70 transition-opacity group-hover:opacity-100">
                      {item.icon}
                    </span>
                  )}

                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-semibold sm:text-sm ${
                    last
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.icon && (
                    <span className="opacity-70">
                      {item.icon}
                    </span>
                  )}

                  {item.label}
                </span>
              )}

              {!last &&
                (separator || (
                  <FaChevronRight className="h-3 w-3 text-muted-foreground/50" />
                ))}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}

/* =========================================================
   BADGE
========================================================= */

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const variants = {
    default:
      "bg-secondary/15 text-secondary ring-1 ring-secondary/20",
    secondary:
      "bg-primary/10 text-primary ring-1 ring-primary/20",
    outline:
      "bg-transparent text-secondary ring-1 ring-secondary/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[11px]",
    lg: "px-3 py-1.5 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   STATS CARD
========================================================= */

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  className = "",
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -2 }}
      className={`group rounded-xl border border-border/50 bg-white p-4 shadow-sm transition-all hover:border-secondary/20 hover:shadow-md sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-primary sm:text-3xl">
            {value}
          </p>

          {trend && (
            <div className="mt-1.5 flex items-center gap-1">
              <span
                className={`text-[11px] font-semibold ${
                  trend.positive
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>

              <span className="text-[11px] text-muted-foreground">
                vs last month
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className="rounded-lg bg-secondary/10 p-2.5 text-secondary transition-colors group-hover:bg-secondary/20">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* =========================================================
   SECTION WRAPPER
========================================================= */

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  compact?: boolean;
}

export function SectionWrapper({
  children,
  className = "",
  id,
  compact = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={className}
    >
      <div
        className={`container mx-auto px-4 lg:px-7 ${
          compact
            ? "py-3 sm:py-4"
            : "py-8 sm:py-10 lg:py-1"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-white/50 p-8 text-center backdrop-blur-sm sm:p-10 ${className}`}
    >
      {icon && (
        <div className="mb-4 rounded-xl bg-secondary/10 p-3.5 text-secondary">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-bold text-primary sm:text-xl">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-secondary/90 hover:shadow-md active:scale-95"
        >
          {action.label}
          <FaChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </motion.div>
  );
}