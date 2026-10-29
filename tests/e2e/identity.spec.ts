import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { revealAll } from "./helpers";
import { collectIdentity } from "./identity";

/**
 * The spacing refinement must not change the visual identity. tests/reference/identity-snapshot.json was captured from the
 * approved design BEFORE the refinement (typography, colours, radii, image/card sizes at 1440px). Heights and line-heights are
 * excluded (they legitimately grow with spacing); widths may move by <= 4 %.
 */
const snapshot = JSON.parse(readFileSync(path.join(__dirname, "../reference/identity-snapshot.json"), "utf8")) as Record<string, Record<string, string | number> | null>;
const IGNORED = new Set(["h", "lineHeight"]);

test("typography, colours, radii and sizes are unchanged from the approved design", async ({ page }) => {
  test.skip(process.env.EXPECT_DEMO === "false", "snapshot includes the demo imagery and content");
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("/"); await revealAll(page);
  const live = await collectIdentity(page);
  const problems: string[] = [];
  for (const [el, props] of Object.entries(snapshot)) {
    if (!props) continue;
    for (const [prop, expected] of Object.entries(props)) {
      if (IGNORED.has(prop)) continue;
      const actual = live[el]?.[prop];
      if (prop === "w") { if (Math.abs(Number(actual) - Number(expected)) / Number(expected) > 0.04) problems.push(`${el}.${prop}: ${expected} -> ${actual}`); continue; }
      if (actual !== expected) problems.push(`${el}.${prop}: ${expected} -> ${actual}`);
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});
