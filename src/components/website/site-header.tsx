"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Navigation } from "@/lib/cms/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const isActive = (path: string | null, href: string) =>
  !!path && (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

/** Sticky header: blur on scroll, animated underline, active indicator, accessible mobile menu. */
export function SiteHeader({ navigation, logo }: { navigation: Navigation["header"]; logo: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = navigation.links.filter((l) => l.enabled);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      data-scrolled={scrolled}
      className={cn("sticky top-0 z-50 w-full text-nav-text transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled || open ? "bg-nav-bg/85 shadow-card backdrop-blur-md" : "bg-nav-bg shadow-[0_1px_0_rgb(var(--color-border-rgb)/0.7)]")}
    >
      <div className="container-abx flex h-[4.2rem] items-center justify-between gap-6 lg:h-[4.6rem]">
        {logo}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-[2.1rem]">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.id}>
                  <Link href={l.href} aria-current={active ? "page" : undefined}
                    className="group relative inline-block py-[0.55rem] text-[0.86rem] font-semibold transition-colors hover:text-hover">
                    {l.label}
                    <span aria-hidden className={cn("absolute inset-x-0 bottom-0 h-[2px] origin-left rounded-full bg-accent transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          {navigation.cta.enabled && <Button href={navigation.cta.href} variant="accent" arrow className="hidden min-h-[2.85rem] px-[1.45rem] text-[0.88rem] sm:inline-flex">{navigation.cta.label}</Button>}
          <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-md transition hover:bg-surface lg:hidden">
            {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div id="mobile-menu" key="menu" className="overflow-hidden border-t border-line lg:hidden"
            initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.28, ease: "easeOut" }}>
            <nav aria-label="Mobile" className="container-abx pb-5 pt-2">
              <ul className="flex flex-col">
                {links.map((l) => {
                  const active = isActive(pathname, l.href);
                  return (
                    <li key={l.id}>
                      <Link href={l.href} aria-current={active ? "page" : undefined}
                        className={cn("flex min-h-12 items-center justify-between border-b border-line/70 text-base font-medium", active && "text-heading")}>
                        {l.label}
                        {active && <span aria-hidden className="size-2 rounded-full bg-accent" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {navigation.cta.enabled && <Button href={navigation.cta.href} variant="accent" arrow className="mt-4 w-full">{navigation.cta.label}</Button>}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
