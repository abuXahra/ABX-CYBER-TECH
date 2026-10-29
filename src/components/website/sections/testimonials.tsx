import type { SectionOf } from "@/lib/cms/sections";
import type { SectionContext } from "@/components/cms/context";
import { SectionShell } from "@/components/cms/section-shell";
import { TestimonialCarousel } from "./testimonial-carousel";

export function TestimonialsSection({ section, ctx }: { section: SectionOf<"testimonials">; ctx: SectionContext }) {
  const c = section.content;
  if (ctx.testimonials.length === 0) return null; // only genuine, published testimonials show publicly

  return (
    <SectionShell section={section} ctx={ctx} fallbackBg="bg-background" defaultPadding="sy [--sy-top:1] [--sy-bot:0.85]">
      {c.eyebrow && <p className="mb-[0.7rem] text-[0.74rem] font-bold uppercase tracking-[0.1em] text-hover">{c.eyebrow}</p>}
      <h2 className="mb-[2rem] font-extrabold tracking-[-0.01em] lg:mb-[2.5rem]" style={{ fontSize: "calc(var(--heading-scale) * clamp(1.4rem, 3vw, 1.5rem))" }}>{c.heading}</h2>
      <TestimonialCarousel items={ctx.testimonials.map((t) => ({ ...t, avatarUrl: t.avatarMediaId ? ctx.media[t.avatarMediaId]?.url : undefined }))} autoplay={c.autoplay} intervalMs={c.intervalMs} />
    </SectionShell>
  );
}
