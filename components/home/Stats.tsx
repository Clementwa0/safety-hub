"use client"
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { FaUsers, FaBuilding, FaStar, FaHeadphones } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";

type Stat = {
  icon: IconType;
  value: number;
  suffix: string;
  label: string;
  isPercent?: boolean;
  literal?: string;
};

const stats: Stat[] = [
  { icon: FaUsers, value: 5000, suffix: "+", label: "Products Supplied" },
  { icon: FaBuilding, value: 300, suffix: "+", label: "Corporate Clients" },
  { icon: FaStar, value: 99, suffix: "%", label: "Customer Satisfaction", isPercent: true },
  { icon: FaHeadphones, value: 0, suffix: "", label: "Support", literal: "24/7" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString()),
    });
    return () => controls.stop();
  }, [inView, to, mv]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="bg-primary text-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="flex items-center gap-4"
          >
            <s.icon className="h-10 w-10 text-accent shrink-0" />
            <div>
              <div className="text-3xl lg:text-4xl font-bold leading-none">
                {s.literal ? s.literal : <Counter to={s.value} suffix={s.suffix} />}
              </div>
              <div className="mt-2 text-sm text-white/70">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}