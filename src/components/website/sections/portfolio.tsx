import Link from "next/link";
import type { SectionOf } from "@/lib/cms/sections";
import type { SectionContext } from "@/components/cms/context";
import { SectionShell } from "@/components/cms/section-shell";
import { CmsImage } from "@/components/cms/cms-image";
import { StaggerGroup, StaggerItem } from "@/components/animations/stagger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PortfolioSection({ section, ctx }: { section: SectionOf<"portfolio-gallery">; ctx: SectionContext }) {
  const c = section.content;
  const projects = ctx.projects.slice(0, c.limit);
  if (projects.length === 0 && c.hideWhenEmpty) return null; // never fabricate work

  const split = section.variant === "split-intro";
  const intro = (
    <div className={cn(!split && "mx-auto max-w-2xl text-center")}>
      {c.eyebrow && <p className="mb-[0.6rem] text-[0.74rem] font-bold uppercase tracking-[0.1em] text-hover">{c.eyebrow}</p>}
      <h2 className="font-extrabold tracking-[-0.015em]" style={{ fontSize: "calc(var(--heading-scale) * clamp(1.5rem, 3vw, 1.65rem))" }}>{c.heading}</h2>
      {c.description && <p className="mt-[1rem] max-w-[34rem] text-[0.88rem] leading-[1.6]">{c.description}</p>}
      {c.button.enabled && <Button href={c.button.href} newTab={c.button.newTab} variant={c.button.variant} arrow className="mt-[1.75rem] min-h-[2.75rem] min-w-[12.4rem]">{c.button.label}</Button>}
    </div>
  );

  return (
    <SectionShell section={section} ctx={ctx} animate={false} fallbackBg="bg-surface" defaultPadding="sy [--sy-top:0.9] [--sy-bot:0.9]"
      innerClassName={cn(split ? "grid items-center gap-[1.5rem] lg:grid-cols-[0.39fr_0.61fr] lg:gap-[2.5rem]" : "space-y-10")}>
      {intro}
      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center">Our projects will be showcased here soon.</p>
      ) : (
        <StaggerGroup animation={section.animation} className="grid items-stretch gap-[var(--card-gap)] sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const media = p.thumbnailMediaId ? ctx.media[p.thumbnailMediaId] : undefined;
            return (
              <StaggerItem key={p.id} durationMs={section.animation.durationMs}>
                <Link href={`/portfolio/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[0.55rem] bg-background shadow-[0_2px_10px_rgb(var(--color-dark-rgb)/0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:transform-none">
                  <div className="relative aspect-[2.15/1] overflow-hidden bg-secondary">
                    {media ? <CmsImage media={media} alt={p.title} sizes="(min-width:900px) 22vw, 50vw" className="transition duration-500 group-hover:scale-110 motion-reduce:transform-none" />
                      : <span aria-hidden className="flex h-full items-center justify-center font-heading text-4xl font-bold text-white/30">{p.title.slice(0, 1)}</span>}
                    <span className="absolute inset-0 flex items-center justify-center bg-dark/65 text-[0.9rem] font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      View Project
                    </span>
                  </div>
                  <div className="px-[1rem] pb-[1.1rem] pt-[1rem]"><h3 className="text-[0.86rem] font-bold leading-tight">{p.title}</h3><p className="mt-[0.4rem] text-[0.74rem] text-hover">{p.category}</p></div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}
    </SectionShell>
  );
}
