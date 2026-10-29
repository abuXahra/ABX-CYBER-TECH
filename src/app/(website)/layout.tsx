import { getPublishedContent } from "@/lib/cms/content";
import { getMediaMap, getPublishedServices, type MediaView, type ServiceView } from "@/lib/cms/collections";
import { isDemoContentVisible } from "@/lib/demo/visibility";
import { Logo } from "@/components/website/logo";
import { SiteFooter } from "@/components/website/site-footer";
import { SiteHeader } from "@/components/website/site-header";

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [navigation, settings] = await Promise.all([getPublishedContent("navigation", "main"), getPublishedContent("settings", "site")]);
  const demo = isDemoContentVisible();

  // Chrome degrades gracefully if these optional lookups fail; the page body itself never does.
  let services: ServiceView[] = [];
  let logo: MediaView | undefined;
  let footerLogo: MediaView | undefined;
  try {
    services = await getPublishedServices();
    const ids = [settings.logoMediaId, settings.footerLogoMediaId].filter((i): i is string => !!i);
    const media = await getMediaMap(ids, demo);
    logo = settings.logoMediaId ? media[settings.logoMediaId] : undefined;
    footerLogo = (settings.footerLogoMediaId ? media[settings.footerLogoMediaId] : undefined) ?? logo;
  } catch (err) {
    console.error("[website] footer/logo lookup failed", err instanceof Error ? err.message : err);
  }

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded-md bg-accent-btn-bg px-4 py-2 font-semibold text-accent-btn-text focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </a>
      <SiteHeader navigation={navigation.header} logo={<Logo name={settings.companyName} tagline={settings.tagline} media={logo} />} />
      {children}
      <SiteFooter settings={settings} navigation={navigation.footer} services={services} logo={footerLogo} showDemo={demo} />
    </>
  );
}
