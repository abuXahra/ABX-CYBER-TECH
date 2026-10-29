import type { ReactNode } from "react";
import type { PageSection } from "@/lib/cms/sections";
import { sectionComponents } from "./section-components";
import { SectionBoundary } from "./section-boundary";
import type { SectionContext } from "./context";

type AnyRenderer = (props: { section: PageSection; ctx: SectionContext }) => ReactNode;

/** Renders validated sections in CMS order, skipping hidden ones and logging any without a renderer. */
export function SectionRenderer({ sections, ctx }: { sections: PageSection[]; ctx: SectionContext }) {
  const visible = sections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);
  const missing = visible.filter((s) => !sectionComponents[s.type]).map((s) => s.type);
  if (missing.length) console.warn(`[cms] no renderer registered for: ${[...new Set(missing)].join(", ")}`);

  return (
    <>
      {visible.map((section) => {
        const Component = sectionComponents[section.type] as AnyRenderer | undefined;
        return Component ? <SectionBoundary key={section.id} type={section.type}><Component section={section} ctx={ctx} /></SectionBoundary> : null;
      })}
    </>
  );
}
