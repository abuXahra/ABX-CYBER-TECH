import { z } from "zod";
import { pageContentSchema, type PageContent } from "./sections";
import { navigationSchema, siteSettingsSchema, type Navigation, type SiteSettings } from "./site";
import { checkThemeAccessibility, DEFAULT_THEME, themeSchema, type ContrastIssue, type Theme } from "./theme";
import { DEFAULT_NAVIGATION, DEFAULT_SETTINGS, defaultPageContent } from "./defaults";

export const SCOPES = ["page", "theme", "navigation", "settings"] as const;
export type Scope = (typeof SCOPES)[number];

export type ContentMap = { page: PageContent; theme: Theme; navigation: Navigation; settings: SiteSettings };

// Input type is `unknown` because schemas use .default() for backward-compatible fields.
export const SCOPE_SCHEMAS: { [S in Scope]: z.ZodType<ContentMap[S], z.ZodTypeDef, unknown> } = {
  page: pageContentSchema as z.ZodType<PageContent, z.ZodTypeDef, unknown>,
  theme: themeSchema,
  navigation: navigationSchema,
  settings: siteSettingsSchema,
};

export function getDefaultContent<S extends Scope>(scope: S, key: string): ContentMap[S] {
  const map: ContentMap = {
    page: defaultPageContent(key),
    theme: DEFAULT_THEME,
    navigation: DEFAULT_NAVIGATION,
    settings: DEFAULT_SETTINGS,
  };
  return map[scope];
}

/** Extra publish-time rules that go beyond structural validation (e.g. theme contrast). */
export function publishBlockers(scope: Scope, content: unknown): ContrastIssue[] {
  if (scope === "theme") return checkThemeAccessibility(content as Theme).errors;
  return [];
}

export const contentTag = (scope: Scope, key: string) => `cms:${scope}:${key}`;
