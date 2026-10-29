"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { PageSection } from "@/lib/cms/sections";

type Animation = PageSection["animation"];

const offsets = {
  "fade-in": { x: 0, y: 0 },
  "slide-up": { x: 0, y: 28 },
  "slide-left": { x: 40, y: 0 },
  "slide-right": { x: -40, y: 0 },
  stagger: { x: 0, y: 20 },
} as const;

/** CMS-configurable scroll reveal. Transform + opacity only; disabled for reduced-motion users. */
export function Reveal({ animation, children, className }: { animation: Animation; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (animation.preset === "none" || reduce) return <div className={className}>{children}</div>;
  const o = offsets[animation.preset];
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: o.x, y: o.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: animation.once, margin: "-80px" }}
      transition={{ duration: animation.durationMs / 1000, delay: animation.delayMs / 1000, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
