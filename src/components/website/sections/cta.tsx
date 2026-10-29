import type { SectionOf } from "@/lib/cms/sections";
import type { SectionContext } from "@/components/cms/context";
import { SectionShell } from "@/components/cms/section-shell";
import { Button } from "@/components/ui/button";

export function CtaSection({ section, ctx }: { section: SectionOf<"call-to-action">; ctx: SectionContext }) {
  const c = section.content;
  return (
    <SectionShell section={section} ctx={ctx} fallbackBg="bg-gradient-to-r from-dark to-secondary" fallbackText="text-white" defaultPadding="sy [--sy-top:0.8] [--sy-bot:0.8]"
      innerClassName="flex flex-col gap-[2rem] lg:flex-row lg:items-center lg:justify-between lg:gap-[3rem]">
      <div className="max-w-[40rem]">
        {c.eyebrow && <p className="mb-[0.7rem] text-[0.74rem] font-bold uppercase tracking-[0.08em] text-cyan">{c.eyebrow}</p>}
        <h2 className="font-extrabold tracking-[-0.01em] !text-inherit" style={{ color: "inherit", fontSize: "calc(var(--heading-scale) * clamp(1.5rem, 3vw, 1.62rem))" }}>{c.heading}</h2>
        {c.description && <p className="mt-[0.7rem] text-[0.92rem] leading-[1.6] opacity-80">{c.description}</p>}
      </div>
      <div className="flex flex-wrap gap-[1.25rem]">
        {c.primaryButton.enabled && <Button href={c.primaryButton.href} newTab={c.primaryButton.newTab} variant={c.primaryButton.variant} arrow className="min-w-[11.2rem]">{c.primaryButton.label}</Button>}
        {c.secondaryButton.enabled && <Button href={c.secondaryButton.href} newTab={c.secondaryButton.newTab} variant={c.secondaryButton.variant === "outline" ? "outline-light" : c.secondaryButton.variant} className="min-w-[12rem]">{c.secondaryButton.label}</Button>}
      </div>
    </SectionShell>
  );
}
