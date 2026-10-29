import { MapPin } from "lucide-react";
import type { SectionOf } from "@/lib/cms/sections";
import type { SectionContext } from "@/components/cms/context";
import { SectionShell } from "@/components/cms/section-shell";
import { CmsImage } from "@/components/cms/cms-image";
import { Button } from "@/components/ui/button";
import { PromoArt } from "../art";
import { FaqAccordion } from "./faq-accordion";

export function FaqSection({ section, ctx }: { section: SectionOf<"faq">; ctx: SectionContext }) {
  const c = section.content;
  if (ctx.faqs.length === 0) return null;
  const promo = c.promo;
  const split = section.variant === "split-promo" && promo.enabled;
  const promoImage = promo.image.mediaId ? ctx.media[promo.image.mediaId] : undefined;
  // The sample contact photo has a badge baked into the picture; only draw the editable badge when it does not.
  const showBadge = !promoImage?.isDemo && !!(promo.badgeTitle || promo.badgeText);
  // FAQPage structured data; "<" is escaped so the JSON can never close the script tag.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: ctx.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  }).replace(/</g, "\\u003c");

  const pill = "inline-block rounded-full border border-primary/50 bg-background px-[0.75rem] py-[0.12rem] text-[0.66rem] font-bold uppercase tracking-[0.06em] text-primary";

  return (
    <SectionShell section={section} ctx={ctx} fallbackBg="bg-background" defaultPadding="sy [--sy-top:1] [--sy-bot:1]"
      innerClassName={split ? "grid items-stretch gap-[2.5rem] lg:grid-cols-[36.1rem_1fr] lg:gap-[4rem]" : "mx-auto max-w-3xl"}>
      <div className={split ? "lg:pt-[0.5rem]" : "py-10"}>
        <div className={split ? "mb-[1.5rem]" : "mb-8 text-center"}>
          {c.eyebrow && <span className={pill}>{c.eyebrow}</span>}
          <h2 className="mt-[0.9rem] font-extrabold tracking-[-0.01em]" style={{ fontSize: "calc(var(--heading-scale) * clamp(1.35rem, 3vw, 1.32rem))" }}>{c.heading}</h2>
        </div>
        <FaqAccordion items={ctx.faqs} allowMultiple={c.allowMultipleOpen} look={split ? "rows" : "card"} />
      </div>

      {split && (
        <aside className="relative isolate min-h-[20rem] overflow-hidden rounded-[1.1rem] bg-surface/60 p-[1.75rem] sm:p-[2.25rem] lg:-mr-[calc(max(0px,(100vw-80rem)/2)+1.15rem)] lg:rounded-r-[1.1rem]">
          <div className="relative z-10 max-w-[17.2rem]">
            {promo.eyebrow && <span className={pill}>{promo.eyebrow}</span>}
            <h2 className="mt-[1.1rem] font-extrabold leading-[1.15] tracking-[-0.015em]" style={{ fontSize: "calc(var(--heading-scale) * clamp(1.4rem, 3vw, 1.85rem))" }}><span className="whitespace-pre-line">{promo.heading}</span></h2>
            {promo.description && <p className="mt-[1rem] text-[0.84rem] leading-[1.6]">{promo.description}</p>}
            {promo.button.enabled && <Button href={promo.button.href} newTab={promo.button.newTab} variant={promo.button.variant} arrow className="mt-[1.75rem] min-w-[9.9rem]">{promo.button.label}</Button>}
          </div>
          {/* Photo: full card width below the text on phones/tablets; on desktop anchored bottom-right with a soft left/top fade. */}
          <div className="pointer-events-none relative -mx-[1.75rem] -mb-[1.75rem] mt-[1.75rem] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_16%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_16%)] sm:-mx-[2.25rem] sm:-mb-[2.25rem] lg:absolute lg:bottom-0 lg:right-0 lg:m-0 lg:h-[19.5rem] lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in] lg:[mask-image:linear-gradient(to_right,transparent_0%,transparent_20%,#000_46%),linear-gradient(to_bottom,transparent_0%,#000_14%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_20%,#000_46%),linear-gradient(to_bottom,transparent_0%,#000_14%)]"
            style={{ aspectRatio: promoImage ? `${promoImage.width} / ${promoImage.height}` : "420 / 360" }}>
            {promoImage
              ? <CmsImage media={promoImage} alt={promo.image.alt} decorative={promo.image.decorative} sizes="(min-width:900px) 30vw, 100vw" className="h-full w-full object-cover object-right-bottom" />
              : <PromoArt className="h-full w-full" />}
          </div>
          {showBadge && (
            <p className="absolute bottom-[1rem] right-[1rem] z-10 flex items-center gap-[0.7rem] rounded-[0.7rem] bg-background px-[0.9rem] py-[0.55rem] shadow-card">
              <span className="flex size-[2rem] items-center justify-center rounded-full bg-hover/20 text-primary"><MapPin aria-hidden className="size-[1rem]" /></span>
              <span className="text-[0.72rem] leading-tight"><span className="block font-bold text-heading">{promo.badgeTitle}</span><span className="block">{promo.badgeText}</span></span>
            </p>
          )}
        </aside>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </SectionShell>
  );
}
