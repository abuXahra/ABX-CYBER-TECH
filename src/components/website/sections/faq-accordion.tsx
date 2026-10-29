"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { FaqView } from "@/lib/cms/collections";
import { cn } from "@/lib/utils";

/** WAI-ARIA accordion: real buttons, aria-expanded/controls, closed panels are inert. */
export function FaqAccordion({ items, allowMultiple, look = "card" }: { items: FaqView[]; allowMultiple: boolean; look?: "card" | "rows" }) {
  const base = useId();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <div className={look === "rows" ? "space-y-[0.7rem]" : "divide-y divide-line rounded-lg border border-line bg-background shadow-card"}>
      {items.map((f) => {
        const isOpen = open.has(f.id);
        const btnId = `${base}-btn-${f.id}`;
        const panelId = `${base}-panel-${f.id}`;
        return (
          <div key={f.id} className={look === "rows" ? "overflow-hidden rounded-[0.55rem] border border-line bg-background shadow-[0_1px_6px_rgb(var(--color-dark-rgb)/0.05)]" : undefined}>
            <h3>
              <button id={btnId} type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(f.id)}
                className="flex min-h-[2.9rem] w-full items-center justify-between gap-4 px-[1.25rem] py-[0.8rem] text-left text-[0.84rem] font-medium text-heading transition hover:bg-surface">
                {f.question}
                <ChevronDown aria-hidden className={cn("size-5 shrink-0 text-primary transition-transform duration-300", isOpen && "rotate-180")} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} inert={!isOpen}
              className={cn("grid transition-[grid-template-rows] duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden"><p className="whitespace-pre-line px-[1.25rem] pb-[1.1rem] text-[0.84rem] leading-relaxed">{f.answer}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
