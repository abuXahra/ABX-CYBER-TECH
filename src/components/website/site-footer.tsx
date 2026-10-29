import Link from "next/link";
import type { MediaView, ServiceView } from "@/lib/cms/collections";
import type { Navigation, SiteSettings } from "@/lib/cms/site";
import { effectiveContact } from "@/lib/demo/content";
import { Icon } from "@/components/ui/icon";
import { CurrentYear } from "./current-year";
import { Logo } from "./logo";
import { SocialIcon } from "./social-icons";

const SOCIAL_LABELS = { facebook: "Facebook", x: "X", instagram: "Instagram", linkedin: "LinkedIn", youtube: "YouTube" } as const;
const digits = (s: string) => s.replace(/[^\d]/g, "");

/**
 * Four-column footer from the approved design. Contact rows and social icons render only for real values;
 * sample (demo) values appear only when `showDemo` is true (development preview).
 */
export function SiteFooter({ settings, navigation, services, logo, showDemo = false }: {
  settings: SiteSettings; navigation: Navigation["footer"]; services: ServiceView[]; logo?: MediaView; showDemo?: boolean;
}) {
  const contact = effectiveContact(settings, showDemo);
  const social = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter((k) => contact.social[k]);
  const heading = "mb-[1.25rem] font-heading text-[0.88rem] font-bold text-white";
  const link = "text-footer-text/85 transition hover:text-accent hover:underline";

  return (
    <footer className="bg-gradient-to-b from-footer-bg to-footer-bg text-footer-text [background-image:linear-gradient(180deg,rgb(var(--color-footer-bg-rgb)),rgb(var(--color-footer-bg-rgb)/0.94))]">
      <div className="container-abx grid gap-y-[2.5rem] pb-[2.5rem] pt-[calc(var(--section-y)*0.75)] sm:grid-cols-2 lg:grid-cols-[26.8rem_11rem_15.5rem_1fr] lg:gap-x-[1.5rem] lg:pb-[3.25rem]">
        <div>
          <Logo name={settings.companyName} tagline={settings.tagline} media={logo} onDark />
          {settings.footer.description && <p className="mt-[1.25rem] max-w-[18rem] text-[0.82rem] leading-[1.6] text-footer-text/90">{settings.footer.description}</p>}
          {social.length > 0 && (
            <ul className="mt-[1.5rem] flex gap-[0.85rem]" aria-label="Social media">
              {social.map((k) => (
                <li key={k}>
                  <a href={contact.social[k]} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[k]}
                    className="flex size-[2.05rem] items-center justify-center rounded-full border border-white/60 text-white transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-btn-text motion-reduce:transform-none">
                    <SocialIcon name={k} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Quick links">
          <h2 className={heading}>Quick Links</h2>
          <ul className="space-y-[0.8rem] text-[0.82rem] leading-[1.2]">{navigation.quickLinks.filter((l) => l.enabled).map((l) => <li key={l.id}><Link className={link} href={l.href}>{l.label}</Link></li>)}</ul>
        </nav>

        {services.length > 0 && (
          <nav aria-label="Services">
            <h2 className={heading}>Our Services</h2>
            <ul className="space-y-[0.8rem] text-[0.82rem] leading-[1.2]">{services.map((s) => <li key={s.id}><Link className={link} href={`/services/${s.slug}`}>{s.name}</Link></li>)}</ul>
          </nav>
        )}

        <div>
          <h2 className={heading}>Contact Info</h2>
          <ul className="space-y-[0.8rem] text-[0.84rem] leading-[1.2] text-footer-text/90">
            {settings.location && <li className="flex gap-[0.7rem]"><Icon name="map-pin" className="mt-[0.15rem] size-[1rem] shrink-0 text-cyan" />{settings.location.replace("Federal Capital Territory", "FCT")}</li>}
            {settings.address && <li className="pl-[1.7rem]">{settings.address}</li>}
            {contact.phone && <li className="flex gap-[0.7rem]"><Icon name="phone" solid className="mt-[0.15rem] size-[1rem] shrink-0 text-cyan" /><a className={link} href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></li>}
            {settings.whatsapp && <li className="flex gap-[0.7rem]"><Icon name="message-circle" className="mt-[0.15rem] size-[1rem] shrink-0 text-cyan" /><a className={link} href={`https://wa.me/${digits(settings.whatsapp)}`}>WhatsApp: {settings.whatsapp}</a></li>}
            {contact.contactEmail && <li className="flex gap-[0.7rem]"><Icon name="mail" solid className="mt-[0.15rem] size-[1rem] shrink-0 text-cyan" /><a className={link} href={`mailto:${contact.contactEmail}`}>{contact.contactEmail}</a></li>}
            {contact.website && <li className="flex gap-[0.7rem]"><Icon name="globe" className="mt-[0.15rem] size-[1rem] shrink-0 text-cyan" /><a className={link} href={contact.website} target="_blank" rel="noopener noreferrer">{contact.website.replace(/^https?:\/\//, "")}</a></li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/10">
        <div className="container-abx flex flex-col gap-2 py-[1.25rem] text-[0.72rem] text-footer-text/80 md:flex-row md:items-center md:justify-between">
          <p>© <CurrentYear /> {settings.footer.copyrightHolder || settings.companyName}. All rights reserved.</p>
          {navigation.legalLinks.some((l) => l.enabled) && (
            <ul className="flex gap-4">{navigation.legalLinks.filter((l) => l.enabled).map((l) => <li key={l.id}><Link className="transition hover:text-accent hover:underline" href={l.href}>{l.label}</Link></li>)}</ul>
          )}
          <p>
            Registered with the Corporate Affairs Commission (CAC)
            {settings.cacNumber && <> <span aria-hidden className="mx-1">|</span> Reg. No: {settings.cacNumber}</>}
          </p>
        </div>
      </div>
    </footer>
  );
}
