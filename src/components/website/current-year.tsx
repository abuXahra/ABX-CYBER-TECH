"use client";

/** Always the visitor's current year, even on statically cached pages. */
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
