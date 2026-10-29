import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SectionOf } from "@/lib/cms/sections";
import type { SectionContext } from "@/components/cms/context";
import { SectionShell } from "@/components/cms/section-shell";
import { Icon } from "@/components/ui/icon";
import { StaggerGroup, StaggerItem } from "@/components/animations/stagger";

const SOLID_ICONS = new Set(["tag", "smartphone", "shopping-cart"]);

/** "Website Development" → ["Website", "Development"]; "E-commerce & Web Apps" → ["E-commerce &", "Web Apps"]. */
export function splitServiceName(name: string): [string, string?] {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return [name];
  const head = parts[1] === "&" && parts.length > 2 ? 2 : 1;
  return [parts.slice(0, head).join(" "), parts.slice(head).join(" ")];
}

export function ServicesSection({ section, ctx }: { section: SectionOf<"services-grid">; ctx: SectionContext }) {
  const c = section.content;
  const services = ctx.services.slice(0, c.limit);
  if (services.length === 0) return null;

  return (
    <SectionShell section={section} ctx={ctx} animate={false} fallbackBg="bg-background" defaultPadding="sy [--sy-top:1] [--sy-bot:0.8]">
      <div className="mx-auto max-w-[44rem] text-center">
        {c.eyebrow && <p className="mb-[0.8rem] text-[0.74rem] font-bold uppercase tracking-[0.1em] text-hover">{c.eyebrow}</p>}
        <h2 className="font-extrabold tracking-[-0.015em]" style={{ fontSize: "calc(var(--heading-scale) * clamp(1.6rem, 3.4vw, 1.82rem))" }}>{c.heading}</h2>
        {c.description && <p className="mt-[1rem] text-[0.92rem] leading-[1.6]">{c.description}</p>}
      </div>

      <StaggerGroup animation={section.animation} className="mt-[2.5rem] grid items-stretch gap-[var(--card-gap)] sm:grid-cols-2 md:grid-cols-3 lg:mt-[3.25rem] lg:grid-cols-5">
        {services.map((s) => {
          const [first, rest] = c.titleBreak ? splitServiceName(s.name) : [s.name];
          return (
            <StaggerItem key={s.id} durationMs={section.animation.durationMs} className="h-full">
              <Link href={`/services/${s.slug}`}
                className="group relative flex h-full min-h-[14.5rem] flex-col rounded-[0.8rem] border border-line bg-background p-[var(--card-pad)] shadow-[0_2px_12px_rgb(var(--color-dark-rgb)/0.05)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-card-hover motion-reduce:transform-none">
                <ArrowUpRight aria-hidden className="absolute right-[1rem] top-[1rem] size-[1rem] text-primary opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span className="mb-[1.5rem] block text-primary transition duration-300 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transform-none">
                  <Icon name={s.icon} solid={SOLID_ICONS.has(s.icon)} strokeWidth={2.2} className="size-[2rem]" />
                </span>
                <h3 className="text-[1.06rem] font-bold leading-[1.28]">{rest ? <>{first}<br />{rest}</> : first}</h3>
                <p className="mt-[0.75rem] text-[0.9rem] leading-[1.6]">{s.shortDescription}</p>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </SectionShell>
  );
}
