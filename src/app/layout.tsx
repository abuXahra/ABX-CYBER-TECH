import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/manrope";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/lora";
import "@fontsource-variable/caveat";
import "@/styles/globals.css";
import { getPublishedContent } from "@/lib/cms/content";
import { themeToCss } from "@/lib/cms/theme";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "ABX CYBER TECH", template: "%s | ABX CYBER TECH" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getPublishedContent("theme", "global");
  return (
    <html lang="en">
      <head>
        {/* themeToCss re-validates the theme; every value is regex/enum/number constrained. */}
        {/* Scroll-reveal content must stay visible when JavaScript is unavailable. */}
        <noscript><style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style></noscript>
        <style id="abx-theme" dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
