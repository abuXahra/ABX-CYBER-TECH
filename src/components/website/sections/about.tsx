import type { SectionOf } from "@/lib/cms/sections";
import type { SectionContext } from "@/components/cms/context";
import { SectionShell, withPreset } from "@/components/cms/section-shell";
import { CmsImage } from "@/components/cms/cms-image";
import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { WorkspaceArt } from "../art";

export function AboutSection({ section, ctx }: { section: SectionOf<"about-split">; ctx: SectionContext }) {
  const c = section.content;
  const image = c.image.mediaId ? ctx.media[c.image.mediaId] : undefined;
  const imageRight = section.variant === "image-right";

  return (
    <SectionShell section={section} ctx={ctx} animate={false} fallbackBg="bg-background" defaultPadding="sy [--sy-top:0.8] [--sy-bot:1]"
      innerClassName="grid items-center gap-[2.5rem] lg:grid-cols-[32.7rem_1fr] lg:gap-[3.5rem]">
      <Reveal animation={withPreset(section.animation, imageRight ? "slide-left" : "slide-right")} className={cn(imageRight && "lg:order-2")}>
        <div className="group relative aspect-[672/432] overflow-hidden rounded-[0.8rem] shadow-[0_4px_18px_rgb(var(--color-dark-rgb)/0.12)]">
          {image ? (
            <CmsImage media={image} alt={c.image.alt} decorative={c.image.decorative} sizes="(min-width:900px) 520px, 100vw"
              className="transition duration-700 group-hover:scale-105 motion-reduce:transform-none" />
          ) : (
            <WorkspaceArt className="h-full w-full transition duration-700 group-hover:scale-105" />
          )}
          {c.imageCaption && (
            <p className="absolute bottom-[0.85rem] left-[1.2rem] flex w-[15.4rem] max-w-[85%] items-center gap-[0.9rem] rounded-[0.9rem] bg-dark/90 px-[1rem] py-[0.8rem] text-[1rem] font-bold leading-[1.25] text-white shadow-card backdrop-blur-sm">
              <span className="flex size-[2.7rem] shrink-0 items-center justify-center rounded-full bg-cyan"><Icon name="users" className="size-[1.4rem] text-dark" /></span>
              {c.imageCaption}
            </p>
          )}
        </div>
      </Reveal>

      <Reveal animation={withPreset(section.animation, imageRight ? "slide-right" : "slide-left")}>
        {c.eyebrow && <p className="mb-[0.75rem] text-[0.74rem] font-bold uppercase tracking-[0.1em] text-hover">{c.eyebrow}</p>}
        <h2 className="font-extrabold tracking-[-0.015em]" style={{ fontSize: "calc(var(--heading-scale) * clamp(1.6rem, 3.2vw, 1.84rem))" }}>{c.heading}</h2>
        <p className="mt-[1.25rem] text-[1.02rem] leading-[1.55]">{c.body}</p>
        {c.mission && <p className="mt-[1rem] text-[0.88rem] leading-[1.6]"><span className="font-semibold text-heading">Our mission: </span>{c.mission}</p>}
        {c.registrationNote && <p className="mt-[0.6rem] text-[0.88rem] font-medium text-heading">{c.registrationNote}</p>}
        {c.highlights.length > 0 && (
          <ul className="mt-[2rem] grid gap-x-[1.5rem] gap-y-[1.5rem] sm:grid-flow-col sm:grid-cols-[21rem_1fr] sm:grid-rows-2">
            {c.highlights.map((h) => (
              <li key={h.title} className="flex items-center gap-[0.8rem]">
                <span className="flex size-[2.6rem] shrink-0 items-center justify-center rounded-full bg-tint text-primary"><Icon name={h.icon} className="size-[1.3rem]" /></span>
                <div><p className="text-[0.95rem] font-bold leading-tight text-heading">{h.title}</p><p className="mt-[0.1rem] text-[0.84rem] leading-tight">{h.description}</p></div>
              </li>
            ))}
          </ul>
        )}
        {c.button.enabled && <Button href={c.button.href} newTab={c.button.newTab} variant={c.button.variant} arrow className="mt-[2.25rem] min-h-[2.75rem] min-w-[15.2rem]">{c.button.label}</Button>}
      </Reveal>
    </SectionShell>
  );
}
