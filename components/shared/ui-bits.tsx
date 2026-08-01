"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronRight, FaStar } from "react-icons/fa6";

/* -------------------------------------------------------------------------- */
/*                               Section Header                               */
/* -------------------------------------------------------------------------- */

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
      className={`max-w-4xl ${
        centered ? "mx-auto text-center" : "text-left"
      } ${className}`}
    >
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-secondary ring-1 ring-secondary/20">
            <FaStar className="h-3 w-3 fill-secondary/30" />
            {eyebrow}
          </span>
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mt-5 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl"
      >
        {title}
      </motion.h2>

      {showDivider && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 80, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className={`mt-5 h-1.5 rounded-full bg-gradient-to-r from-secondary to-secondary/50 ${
            centered ? "mx-auto" : ""
          }`}
        />
      )}

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Counter                                   */
/* -------------------------------------------------------------------------- */

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
  duration = 2000,
  className = "",
}: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let frame: number;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
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
    <div ref={ref} className={`inline-flex items-baseline ${className}`}>
      {prefix && (
        <span className="mr-1 text-lg font-medium text-muted-foreground">
          {prefix}
        </span>
      )}
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl lg:text-6xl"
      >
        {count.toLocaleString()}
      </motion.span>
      {suffix && (
        <span className="ml-1 text-lg font-medium text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Breadcrumb                                  */
/* -------------------------------------------------------------------------- */

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
    <nav aria-label="Breadcrumb" className={`${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <motion.li
              key={`${item.label}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center gap-1.5"
            >
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
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
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold ${
                    last
                      ? "bg-white/10 text-white"
                      : "text-white/70"
                  }`}
                >
                  {item.icon && (
                    <span className="opacity-70">{item.icon}</span>
                  )}
                  {item.label}
                </span>
              )}

              {!last &&
                (separator || (
                  <FaChevronRight className="h-3.5 w-3.5 text-white/40" />
                ))}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Badge Component                               */
/* -------------------------------------------------------------------------- */

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
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Stats Card Component                           */
/* -------------------------------------------------------------------------- */

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`group rounded-2xl border border-border/50 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-secondary/20 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.positive
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-secondary/10 p-3 text-secondary transition-colors group-hover:bg-secondary/20">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Section Wrapper                             */
/* -------------------------------------------------------------------------- */

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "gray" | "primary" | "gradient";
}

export function SectionWrapper({
  children,
  className = "",
  id,
  background = "white",
}: SectionWrapperProps) {
  const backgrounds = {
    white: "bg-white",
    gray: "bg-slate-50",
    primary: "bg-primary text-white",
    gradient:
      "bg-gradient-to-br from-primary via-primary to-secondary/20 text-white",
  };

  return (
    <section
      id={id}
      className={`${backgrounds[background]} ${className}`}
    >
      <div className="container mx-auto px-4 py-16 sm:py-20 lg:px-8 lg:py-24">
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Empty State                                 */
/* -------------------------------------------------------------------------- */

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 bg-white/50 p-12 text-center backdrop-blur-sm ${className}`}
    >
      {icon && (
        <div className="mb-6 rounded-2xl bg-secondary/10 p-4 text-secondary">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-secondary/90 hover:shadow-md active:scale-95"
        >
          {action.label}
          <FaChevronRight className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}