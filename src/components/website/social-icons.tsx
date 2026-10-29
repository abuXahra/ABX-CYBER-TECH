import type { ReactNode } from "react";

/** Minimal inline brand glyphs (lucide v1 ships no brand icons). Decorative; the link carries the label. */
const GLYPHS: Record<string, ReactNode> = {
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8.5c0-.3.2-.5.5-.5z" fill="currentColor" />,
  x: <path d="M5 4l5.6 7.4L5 20h2l4.5-5.6L16 20h3.5l-6-7.9L18.8 4h-2l-4.2 5.2L8.5 4z" fill="currentColor" />,
  instagram: <><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="16.2" cy="7.8" r="1" fill="currentColor" /></>,
  linkedin: <path d="M6.5 9.5h3V19h-3zM8 5a1.8 1.8 0 1 1 0 3.6A1.8 1.8 0 0 1 8 5zm3.5 4.5h2.9v1.3c.5-.9 1.6-1.5 3-1.5 2.7 0 3.1 1.8 3.1 4V19h-3v-4.9c0-1.1 0-2.3-1.5-2.3s-1.6 1.1-1.6 2.2V19h-3z" fill="currentColor" />,
  youtube: <><rect x="3.5" y="6.5" width="17" height="11" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M10.5 9.7v4.6l4-2.3z" fill="currentColor" /></>,
};

export function SocialIcon({ name }: { name: keyof typeof GLYPHS | string }) {
  return <svg aria-hidden viewBox="0 0 24 24" className="size-[1.1rem]">{GLYPHS[name]}</svg>;
}
