"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { PageSection } from "@/lib/cms/sections";

const container = (gap: number, delay: number) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});
const item = (duration: number) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration, ease: "easeOut" as const } },
});

/** Staggered card reveal driven by the section's CMS animation settings. */
export function StaggerGroup({ animation, className, children }: { animation: PageSection["animation"]; className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce || animation.preset === "none") return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={container(0.09, animation.delayMs / 1000)} initial="hidden"
      whileInView="show" viewport={{ once: animation.once, margin: "-60px" }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ durationMs = 500, className, children }: { durationMs?: number; className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return <motion.div className={className} variants={item(durationMs / 1000)}>{children}</motion.div>;
}
