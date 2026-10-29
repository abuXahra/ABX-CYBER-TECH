import Link from "next/link";
import type { MediaView } from "@/lib/cms/collections";
import { CmsImage } from "@/components/cms/cms-image";
import { cn } from "@/lib/utils";

/**
 * Uses the approved logo asset from the media library (Site Settings → logo). The text wordmark is only a
 * safe fallback for when no logo has been set.
 */
export function Logo({ name, tagline, media, onDark, className }: {
  name: string; tagline: string; media?: MediaView; onDark?: boolean; className?: string;
}) {
  if (media) {
    return (
      <Link href="/" aria-label={`${name} — home`} className={cn("block w-[13.5rem] shrink-0 lg:w-[18.4rem]", className)}>
        <CmsImage media={media} alt={media.alt || name} priority sizes="(min-width:900px) 300px, 216px" className="h-auto w-full object-contain object-left" />
      </Link>
    );
  }
  return (
    <Link href="/" aria-label={`${name} — home`} className={cn("group inline-flex items-center gap-3", className)}>
      <span aria-hidden className={cn("font-heading text-[2rem] font-extrabold leading-none tracking-tighter", onDark ? "text-white" : "text-primary")}>
        AB<span className={onDark ? "text-white/70" : "text-primary/60"}>X</span>
      </span>
      <span className="leading-tight">
        <span className={cn("block font-heading text-[15px] font-bold tracking-tight", onDark ? "text-white" : "text-heading")}>{name}</span>
        {tagline && <span className={cn("block text-[9px] font-medium tracking-[0.12em]", onDark ? "text-footer-text/70" : "text-primary")}>{tagline}</span>}
      </span>
    </Link>
  );
}
