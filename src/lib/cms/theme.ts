import { z } from "zod";

export const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit HEX colour such as #115E59");

/** Approved, bundled fonts (via @fontsource-variable). No remote font URLs are ever accepted. */
export const FONT_OPTIONS = {
  inter: { label: "Inter", stack: "'Inter Variable', ui-sans-serif, system-ui, sans-serif" },
  "plus-jakarta-sans": {
    label: "Plus Jakarta Sans",
    stack: "'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif",
  },
  manrope: { label: "Manrope", stack: "'Manrope Variable', ui-sans-serif, system-ui, sans-serif" },
  "dm-sans": { label: "DM Sans", stack: "'DM Sans Variable', ui-sans-serif, system-ui, sans-serif" },
  lora: { label: "Lora", stack: "'Lora Variable', ui-serif, Georgia, serif" },
} as const;

export type FontKey = keyof typeof FONT_OPTIONS;
const fontKey = z.enum(["inter", "plus-jakarta-sans", "manrope", "dm-sans", "lora"]);

export const COLOR_KEYS = [
  "primary", "secondary", "dark", "accent", "background", "surface", "foreground", "heading",
  "border", "navbarBg", "navbarText", "footerBg", "footerText", "buttonBg", "buttonText",
  "accentButtonBg", "accentButtonText", "hover", "focusRing", "cyan", "tint",
] as const;
/** Newer tokens are optional so previously published themes stay valid. */
const OPTIONAL_COLOR_DEFAULTS: Partial<Record<(typeof COLOR_KEYS)[number], string>> = { cyan: "#41DCE9", tint: "#BDF0F2" };
export type ColorKey = (typeof COLOR_KEYS)[number];

export const themeSchema = z.object({
  colors: z.object(Object.fromEntries(COLOR_KEYS.map((k) => [k, OPTIONAL_COLOR_DEFAULTS[k] ? hex.default(OPTIONAL_COLOR_DEFAULTS[k]!) : hex])) as Record<ColorKey, typeof hex>),
  typography: z.object({
    headingFont: fontKey,
    bodyFont: fontKey,
    headingScale: z.number().min(0.8).max(1.4),
    bodyScale: z.number().min(0.85).max(1.25),
    headingWeight: z.enum(["500", "600", "700", "800"]),
    bodyWeight: z.enum(["400", "500"]),
    lineHeight: z.number().min(1.3).max(2),
  }),
  shape: z.object({
    radius: z.number().int().min(0).max(32),
    shadow: z.enum(["none", "soft", "medium", "strong"]),
  }),
  spacing: z.object({
    section: z.enum(["compact", "comfortable", "spacious"]),
    /** Padding inside cards and the gap between them. Optional so previously published themes stay valid. */
    card: z.enum(["cozy", "comfortable", "roomy"]).default("comfortable"),
  }),
});

export type Theme = z.infer<typeof themeSchema>;

/**
 * Safe default theme. Note: white text on #D97706 is only 3.2:1, so the amber
 * CTA uses dark teal text (≈4.5:1) to remain WCAG AA.
 */
export const DEFAULT_THEME: Theme = {
  colors: {
    primary: "#00595C",
    secondary: "#01545A",
    dark: "#003036",
    accent: "#FCAA2B",
    background: "#FFFFFF",
    surface: "#EEFAFB",
    foreground: "#3F505B",
    heading: "#0B2530",
    border: "#E3EBED",
    navbarBg: "#FFFFFF",
    navbarText: "#0B2530",
    footerBg: "#003036",
    footerText: "#D6E8EA",
    buttonBg: "#005658",
    buttonText: "#FFFFFF",
    accentButtonBg: "#FCAA2B",
    accentButtonText: "#0B2530",
    hover: "#007C84",
    focusRing: "#D97706",
    cyan: "#41DCE9",
    tint: "#BDF0F2",
  },
  typography: {
    headingFont: "plus-jakarta-sans",
    bodyFont: "plus-jakarta-sans",
    headingScale: 1,
    bodyScale: 1,
    headingWeight: "700",
    bodyWeight: "400",
    lineHeight: 1.6,
  },
  shape: { radius: 8, shadow: "soft" },
  spacing: { section: "comfortable", card: "comfortable" },
};

/* ---------- colour maths ---------- */

function channels(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function luminance(h: string): number {
  const [r, g, b] = channels(h).map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastIssue = { pair: string; ratio: number; required: number; message: string };

/** Errors block publishing; warnings are shown in the Appearance Manager. */
export function checkThemeAccessibility(t: Theme): { errors: ContrastIssue[]; warnings: ContrastIssue[] } {
  const c = t.colors;
  const errors: ContrastIssue[] = [];
  const warnings: ContrastIssue[] = [];
  const check = (list: ContrastIssue[], label: string, fg: string, bg: string, required: number) => {
    const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;
    if (ratio < required) {
      list.push({ pair: label, ratio, required, message: `${label} contrast is ${ratio}:1; at least ${required}:1 is required.` });
    }
  };
  check(errors, "Body text on background", c.foreground, c.background, 4.5);
  check(errors, "Body text on surface", c.foreground, c.surface, 4.5);
  check(errors, "Headings on background", c.heading, c.background, 4.5);
  check(errors, "Headings on surface", c.heading, c.surface, 4.5);
  check(errors, "Primary button text", c.buttonText, c.buttonBg, 4.5);
  check(errors, "Accent button text", c.accentButtonText, c.accentButtonBg, 4.5);
  check(errors, "Navbar text", c.navbarText, c.navbarBg, 4.5);
  check(errors, "Footer text", c.footerText, c.footerBg, 4.5);
  check(errors, "Focus ring on background", c.focusRing, c.background, 3);
  check(warnings, "Link hover colour on background", c.hover, c.background, 4.5);
  check(warnings, "Accent colour on background (large text only)", c.accent, c.background, 3);
  return { errors, warnings };
}

/* ---------- design tokens -> CSS variables ---------- */

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
const rgbTriplet = (h: string) => channels(h).join(" ");

const SHADOWS = {
  none: ["none", "none"],
  soft: ["0 1px 3px rgb(4 47 46 / .08), 0 4px 16px rgb(4 47 46 / .06)", "0 8px 28px rgb(4 47 46 / .14)"],
  medium: ["0 4px 12px rgb(4 47 46 / .12), 0 10px 30px rgb(4 47 46 / .08)", "0 14px 38px rgb(4 47 46 / .2)"],
  strong: ["0 8px 24px rgb(4 47 46 / .18), 0 16px 40px rgb(4 47 46 / .12)", "0 20px 50px rgb(4 47 46 / .28)"],
} as const;

/** Vertical section rhythm: [desktop, tablet (<900px), mobile (<640px)]. Desktop rem values scale with the viewport. */
const SECTION_Y = {
  compact: ["4.5rem", "3.5rem", "2.75rem"],
  comfortable: ["5.5rem", "4.25rem", "3.5rem"],
  spacious: ["7rem", "5.25rem", "4.25rem"],
} as const;
const CARD = { cozy: ["1.5rem", "1.25rem"], comfortable: ["1.75rem", "1.5rem"], roomy: ["2rem", "1.75rem"] } as const;

/** Serialises a *validated* theme. Every value is a regex/enum/number-constrained, so no CSS injection is possible. */
export function themeToCss(input: Theme): string {
  const t = themeSchema.parse(input);
  const lines: string[] = [];
  for (const key of COLOR_KEYS) {
    const value = t.colors[key].toLowerCase();
    lines.push(`--color-${kebab(key)}: ${value};`, `--color-${kebab(key)}-rgb: ${rgbTriplet(value)};`);
  }
  lines.push(
    `--font-heading: ${FONT_OPTIONS[t.typography.headingFont].stack};`,
    `--font-body: ${FONT_OPTIONS[t.typography.bodyFont].stack};`,
    `--heading-scale: ${t.typography.headingScale};`,
    `--body-scale: ${t.typography.bodyScale};`,
    `--heading-weight: ${t.typography.headingWeight};`,
    `--body-weight: ${t.typography.bodyWeight};`,
    `--line-height: ${t.typography.lineHeight};`,
    `--radius: ${t.shape.radius}px;`,
    `--radius-lg: ${Math.round(t.shape.radius * 1.5)}px;`,
    `--radius-xl: ${Math.round(t.shape.radius * 2)}px;`,
    `--shadow-card: ${SHADOWS[t.shape.shadow][0]};`,
    `--shadow-card-hover: ${SHADOWS[t.shape.shadow][1]};`,
    `--section-y: ${SECTION_Y[t.spacing.section][0]};`,
    `--card-pad: ${CARD[t.spacing.card][0]};`,
    `--card-gap: ${CARD[t.spacing.card][1]};`,
  );
  const [, tablet, mobile] = SECTION_Y[t.spacing.section];
  return `:root{${lines.join("")}}@media (max-width:899px){:root{--section-y:${tablet}}}@media (max-width:639px){:root{--section-y:${mobile};--card-pad:1.5rem}}`;
}
