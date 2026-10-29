import type { SectionOf } from "@/lib/cms/sections";
import type { SectionContext } from "@/components/cms/context";
import { SectionShell } from "@/components/cms/section-shell";
import { CmsImage } from "@/components/cms/cms-image";
import { Reveal } from "@/components/animations/reveal";
import { Float } from "@/components/animations/float";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DeviceArt } from "../art";
import { DeviceFrames } from "../device-frames";

/** Splits the headline around the editor-chosen highlight phrase (rendered in the accent colour). */
function Line({ text, highlight }: { text: string; highlight: string }) {
  const i = highlight ? text.indexOf(highlight) : -1;
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<span className="text-accent">{highlight}</span>{text.slice(i + highlight.length)}</>;
}
/** Editors control line breaks with a newline in the headline field. */
function Headline({ text, highlight }: { text: string; highlight: string }) {
  return <>{text.split("\n").map((line, i) => <span key={i} className="block"><Line text={line} highlight={highlight} /></span>)}</>;
}

export function HeroSection({ section, ctx }: { section: SectionOf<"hero">; ctx: SectionContext }) {
  const c = section.content;
  const image = c.image.mediaId ? ctx.media[c.image.mediaId] : undefined;
  const mobileImage = c.mobileImage.mediaId ? ctx.media[c.mobileImage.mediaId] : undefined;
  const laptop = c.laptopScreen.mediaId ? ctx.media[c.laptopScreen.mediaId] : undefined;
  const phone = c.phoneScreen.mediaId ? ctx.media[c.phoneScreen.mediaId] : undefined;
  const framed = !!(laptop || phone);

  return (
    <SectionShell
      section={section} ctx={ctx} animate={false} relativeContainer={false} fallbackBg="bg-gradient-to-r from-surface via-background to-background"
      defaultPadding="sy [--sy-top:0.8] [--sy-bot:0.7] lg:py-0" className="lg:min-h-[38rem]" innerClassName="lg:flex lg:min-h-[38rem] lg:items-center"
      behind={<span aria-hidden className="pointer-events-none absolute -left-[6%] top-[6%] h-[70%] w-[22%] rounded-full bg-primary/[0.05] blur-3xl" />}
    >
      <Reveal animation={section.animation} className="relative z-10 lg:w-[42%] lg:py-[1rem] lg:pl-[0.55rem]">
        {c.eyebrow && <p className="mb-[1.25rem] text-[0.8rem] font-bold uppercase tracking-[0.1em] text-hover">{c.eyebrow}</p>}
        <h1 className="font-heading font-extrabold leading-[1.02] tracking-[-0.025em]"
          style={{ fontSize: "calc(var(--heading-scale) * clamp(2.4rem, 6vw, 3.28rem))" }}>
          <Headline text={c.headline} highlight={c.headlineHighlight} />
        </h1>
        {c.description && <p className="mt-[1.6rem] max-w-[29.5rem] text-[0.98rem] leading-[1.55]">{c.description}</p>}
        <div className="mt-[2.25rem] flex flex-wrap gap-[1.3rem]">
          {c.primaryButton.enabled && <Button href={c.primaryButton.href} newTab={c.primaryButton.newTab} variant={c.primaryButton.variant} arrow className="min-w-[11.2rem]">{c.primaryButton.label}</Button>}
          {c.secondaryButton.enabled && <Button href={c.secondaryButton.href} newTab={c.secondaryButton.newTab} variant={c.secondaryButton.variant} className="min-w-[12rem]">{c.secondaryButton.label}</Button>}
        </div>
        {c.badges.length > 0 && (
          <ul className="mt-[3rem] flex flex-wrap gap-x-[2.6rem] gap-y-[0.9rem] text-[0.9rem] text-heading">
            {c.badges.map((b) => (
              <li key={b.text} className="flex items-center gap-[0.65rem]"><Icon name={b.icon} className="size-[1.35rem] text-primary" />{b.text}</li>
            ))}
          </ul>
        )}
      </Reveal>

      {/* Soft fade on the left edge so the composition blends into the hero background (desktop). */}
      <div className="relative mt-[2.5rem] lg:absolute lg:right-[max(0px,calc((100vw-90rem)/2))] lg:top-1/2 lg:mt-0 lg:aspect-[1122/636] lg:w-[53.5rem] lg:-translate-y-1/2 lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_16%),linear-gradient(to_bottom,transparent_0%,#000_10%,#000_92%,transparent_100%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_16%),linear-gradient(to_bottom,transparent_0%,#000_10%,#000_92%,transparent_100%)] min-[1441px]:[mask-image:linear-gradient(to_right,transparent_0%,#000_16%,#000_92%,transparent_100%),linear-gradient(to_bottom,transparent_0%,#000_10%,#000_92%,transparent_100%)] min-[1441px]:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_16%,#000_92%,transparent_100%),linear-gradient(to_bottom,transparent_0%,#000_10%,#000_92%,transparent_100%)]">
        <Float enabled={c.floatingMotion} className="h-full w-full">
          {framed ? (
            <div className="aspect-[1122/636] w-full"><DeviceFrames laptop={laptop} phone={phone} laptopAlt={c.laptopScreen.alt} phoneAlt={c.phoneScreen.alt} /></div>
          ) : image ? (
            <>
              <CmsImage media={image} alt={c.image.alt} decorative={c.image.decorative} priority sizes="(min-width:900px) 60vw, 100vw"
                className="hidden h-full w-full object-cover object-left lg:block" />
              <CmsImage media={mobileImage ?? image} alt={c.image.alt} decorative={c.image.decorative} priority sizes="100vw" className="h-auto w-full lg:hidden" />
            </>
          ) : (
            <DeviceArt className="h-auto w-full drop-shadow-2xl lg:h-full" />
          )}
        </Float>
      </div>
    </SectionShell>
  );
}
