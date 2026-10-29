import { BadgeCheck } from "lucide-react";
import type { SectionOf } from "@/lib/cms/sections";
import type { SectionContext } from "@/components/cms/context";
import { SectionShell } from "@/components/cms/section-shell";
import { CmsImage } from "@/components/cms/cms-image";
import { Icon } from "@/components/ui/icon";
import { visibleLogos } from "@/lib/demo/content";

/**
 * Horizontal credibility/partner strip. Sample (demo) logos appear only in the demo preview; the public site shows
 * real logos, or — when there are none — the verified capability facts.
 */
export function CredibilitySection({ section, ctx }: { section: SectionOf<"credibility-band">; ctx: SectionContext }) {
  const c = section.content;
  const logos = visibleLogos(c.logos, ctx.showDemo).filter((l) => (l.image.mediaId && ctx.media[l.image.mediaId]) || l.icon);
  const showLogos = section.variant === "logos" && logos.length > 0;
  if (!showLogos && c.items.length === 0) return null; // nothing truthful to show → hide gracefully
  const heading = showLogos ? c.logosHeading || c.heading : c.heading;

  return (
    <SectionShell section={section} ctx={ctx} fallbackBg="bg-surface/70" defaultPadding="sy [--sy-top:0.5] [--sy-bot:0.5]">
      {heading && <h2 className="mb-[1.6rem] text-center font-body text-[0.7rem] font-semibold uppercase tracking-[0.13em] !text-foreground/75">{heading}</h2>}
      {showLogos ? (
        <ul className="flex flex-wrap items-center justify-center gap-x-[2.2rem] gap-y-4 lg:flex-nowrap lg:justify-between lg:px-[2.3rem]">
          {logos.map((l) => {
            const media = l.image.mediaId ? ctx.media[l.image.mediaId] : undefined;
            return (
              <li key={l.name} className="opacity-90 transition hover:opacity-100">
                {media ? (
                  <span className="block h-[2.2rem] w-[8rem]"><CmsImage media={media} alt={l.image.alt || l.name} sizes="128px" className="object-contain" /></span>
                ) : (
                  <span className="flex items-center gap-[0.6rem] font-heading text-[1.12rem] font-semibold text-foreground">
                    {l.icon && <Icon name={l.icon} solid className="size-[2rem] text-heading/80" strokeWidth={1.6} />}{l.name}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="flex flex-wrap items-center justify-center gap-x-[2.6rem] gap-y-3">
          {c.items.map((i) => (
            <li key={i.title} className="flex items-center gap-[0.6rem] text-[0.92rem]">
              <BadgeCheck aria-hidden className="size-[1.3rem] shrink-0 text-primary" />
              <span><span className="font-semibold text-heading">{i.title}</span>{i.description && <span className="text-foreground/80"> · {i.description}</span>}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
