"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** One gentle, slow float (transform only). Off for reduced-motion users. */
export function Float({ enabled = true, className, children }: { enabled?: boolean; className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce || !enabled) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} animate={{ y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
      {children}
    </motion.div>
  );
}
