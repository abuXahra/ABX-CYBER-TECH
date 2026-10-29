import type { CSSProperties, ReactNode } from "react";
import type { PageSection } from "@/lib/cms/sections";
import { Reveal } from "@/components/animations/reveal";
import { CmsImage } from "./cms-image";
import type { SectionContext } from "./context";
import { cn } from "@/lib/utils";

/** Editor-chosen padding. "inherit" uses the section's own design default (`defaultPadding`). */
/** Editor-chosen padding scales the theme token --section-y, so it follows the desktop/tablet/mobile rhythm. */
const PADDING = {
  none: "py-0",
  sm: "sy [--sy-top:0.5] [--sy-bot:0.5]",
  md: "sy [--sy-top:0.75] [--sy-bot:0.75]",
  lg: "sy [--sy-top:1] [--sy-bot:1]",
  xl: "sy [--sy-top:1.35] [--sy-bot:1.35]",
} as const;
const WIDTH = { contained: "container-abx", wide: "container-abx-wide", full: "w-full px-4 sm:px-6" } as const;

/**
 * Applies the section's validated CMS style settings (background, text colour, spacing, width).
 * `innerClassName` is applied to the element that DIRECTLY wraps the section's children — also when the
 * scroll-reveal wrapper is used — so grid/flex layouts always apply to the real columns.
 */
export function SectionShell({
  section, ctx, fallbackBg, fallbackText, defaultPadding = "sy", className, innerClassName, animate = true,
  relativeContainer = true, behind, children,
}: {
  section: PageSection; ctx: SectionContext; fallbackBg?: string; fallbackText?: string; defaultPadding?: string;
  className?: string; innerClassName?: string; animate?: boolean; relativeContainer?: boolean; behind?: ReactNode; children: ReactNode;
}) {
  const { background, textColor, paddingY, width } = section.styles;
  const style: CSSProperties = {};
  if (background.mode === "color" && background.color) style.backgroundColor = background.color;
  if (background.mode === "gradient" && background.gradientFrom && background.gradientTo) {
    style.backgroundImage = `linear-gradient(${background.gradientAngle}deg, ${background.gradientFrom}, ${background.gradientTo})`;
  }
  if (textColor) style.color = textColor;
  const customBg = background.mode !== "none";
  const bgImage = background.mode === "image" && background.imageMediaId ? ctx.media[background.imageMediaId] : undefined;

  return (
    <section
      id={section.id} data-section={section.type} style={style}
      className={cn("relative overflow-hidden", paddingY === "inherit" ? defaultPadding : PADDING[paddingY], !customBg && fallbackBg, !textColor && fallbackText, className)}
    >
      {bgImage && (
        <>
          <div className="absolute inset-0"><CmsImage media={bgImage} alt="" decorative sizes="100vw" /></div>
          <div className="absolute inset-0 bg-black" style={{ opacity: background.overlayOpacity }} />
        </>
      )}
      {behind}
      <div className={cn(relativeContainer && "relative", WIDTH[width])}>
        {animate
          ? <Reveal animation={section.animation} className={innerClassName}>{children}</Reveal>
          : <div className={innerClassName}>{children}</div>}
      </div>
    </section>
  );
}

/** Same section animation, different preset (e.g. image slides in from the left, text from the right). */
export const withPreset = (a: PageSection["animation"], preset: PageSection["animation"]["preset"]) =>
  a.preset === "none" ? a : { ...a, preset };
