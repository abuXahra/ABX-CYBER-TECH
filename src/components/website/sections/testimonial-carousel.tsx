"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { TestimonialView } from "@/lib/cms/collections";
import { cn } from "@/lib/utils";

type Item = TestimonialView & { avatarUrl?: string };

/**
 * Scroll-snap carousel (3 cards on desktop, 1 on phones). The indicators are real controls: each selects a
 * testimonial — it scrolls into view when the strip is scrollable and is always highlighted. Optional autoplay.
 */
export function TestimonialCarousel({ items, autoplay, intervalMs }: { items: Item[]; autoplay: boolean; intervalMs: number }) {
  const reduce = useReducedMotion();
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrollable, setScrollable] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el || el.clientWidth <= 0) return; // zero-width during a resize/screenshot: never divide by it
    setScrollable(el.scrollWidth > el.clientWidth + 1);
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, items.length]);

  /** Index of the card nearest the left edge. Guards against a zero-width strip (e.g. during a window resize). */
  const syncFromScroll = useCallback(() => {
    const el = track.current;
    if (!el || el.clientWidth <= 0 || el.scrollWidth <= el.clientWidth + 1) return; // not scrollable → keep manual selection
    const cards = Array.from(el.children) as HTMLElement[];
    const left = el.scrollLeft;
    let best = 0, dist = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - el.offsetLeft - left); if (d < dist) { dist = d; best = i; } });
    setActive(best);
  }, []);

  const select = useCallback((i: number) => {
    const el = track.current;
    const next = ((i % items.length) + items.length) % items.length;
    setActive(next);
    const card = el?.children[next] as HTMLElement | undefined;
    if (el && card && el.scrollWidth > el.clientWidth + 1) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }, [items.length, reduce]);

  useEffect(() => {
    if (!autoplay || reduce || paused || items.length < 2) return;
    const id = setInterval(() => select(active + 1), intervalMs);
    return () => clearInterval(id);
  }, [autoplay, reduce, paused, items.length, active, intervalMs, select]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <ul ref={track} onScroll={syncFromScroll} tabIndex={0}
        className="flex snap-x snap-mandatory gap-[var(--card-gap)] overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((t, i) => (
          <li key={t.id} aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`}
            className="w-full shrink-0 snap-start md:w-[calc((100%-var(--card-gap))/2)] lg:w-[calc((100%-2*var(--card-gap))/3)]">
            <figure className={cn("flex h-full min-h-[10rem] flex-col rounded-[0.5rem] border bg-background px-[1.5rem] pb-[1.4rem] pt-[1.25rem] transition-shadow duration-300",
              scrollable && i === active ? "border-primary/40 shadow-card" : "border-line")}>
              <span aria-hidden className="font-heading text-[1.9rem] font-extrabold leading-[0.7] text-primary">“</span>
              <blockquote className="mt-[0.15rem] flex-1 text-[0.84rem] leading-[1.55] text-heading/85">“{t.quote}”</blockquote>
              <figcaption className="mt-[1.1rem] flex items-center gap-[0.85rem]">
                {t.avatarUrl
                  ? <Image src={t.avatarUrl} alt="" width={52} height={52} className="size-[3rem] rounded-full object-cover" />
                  : <span aria-hidden className="flex size-[3rem] items-center justify-center rounded-full bg-primary font-semibold text-white">{t.authorName.slice(0, 1)}</span>}
                <span><span className="block text-[0.88rem] font-bold leading-tight text-heading">{t.authorName}</span>
                  <span className="block text-[0.78rem] leading-tight text-foreground/80">{[t.authorRole, t.company].filter(Boolean).join(", ")}</span></span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {items.length > 1 && (
        <div className="mt-[1.75rem] flex justify-center gap-[0.6rem]" role="group" aria-label="Choose a testimonial">
          {items.map((t, i) => (
            <button key={t.id} type="button" aria-label={`Show testimonial from ${t.authorName}`} aria-current={i === active}
              onClick={() => select(i)}
              className={cn("size-[0.55rem] rounded-full transition-colors", i === active ? "bg-primary" : "bg-line hover:bg-primary/50")} />
          ))}
        </div>
      )}
    </div>
  );
}
