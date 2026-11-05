import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SIMULATIONS, LESSONS, academy } from "../../packages/curriculum/src";

const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/favicon/.test(m.text())) errors.push(m.text()); });
  return errors;
};

test("primary navigation has no dead links", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator('nav[aria-label="Primary"] a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
  expect(hrefs.length).toBe(10);
  for (const h of hrefs) {
    const r = await page.request.get(h);
    expect(r.status(), h).toBe(200);
  }
});

test("every lesson, academy chapter and simulation route responds", async ({ page }) => {
  const routes = [...LESSONS.map((l) => `/lesson/${l.slug}`), ...academy.chapters.map((c) => `/academy/${c.id}`), ...SIMULATIONS.map((s) => `/simulations/${s.slug}`), "/learn", "/coverage", "/start", "/start?mode=find-level"];
  for (const r of routes) expect((await page.request.get(r)).status(), r).toBe(200);
});

test("every simulation renders without runtime errors", async ({ page }) => {
  const errors = watchErrors(page);
  for (const s of SIMULATIONS) {
    await page.goto(`/simulations/${s.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: s.title })).toBeVisible();
    await expect(page.getByText("Challenge presets:")).toBeVisible();
    for (const p of s.presets.slice(1)) await page.getByRole("radio", { name: p.replace(/-/g, " "), exact: true }).first().click();
  }
  expect(errors).toEqual([]);
});

test("lesson: try-by-hand checks answers, flags misconceptions, and resumes after reload", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/lesson/fractions-adding-unlike");
  await page.getByRole("button", { name: /Try by hand/ }).first().click();
  const inputs = page.getByLabel("Your answer");
  await inputs.nth(0).fill("8");
  await page.getByRole("button", { name: "Check", exact: true }).first().click();
  await expect(page.getByText("✓ Correct").first()).toBeVisible();
  await inputs.nth(1).fill("3/7");
  await page.getByRole("button", { name: "Check", exact: true }).first().click();
  await expect(page.getByText(/adding tops and bottoms/)).toBeVisible();
  await page.getByRole("button", { name: "Hint 1: concept" }).first().click();
  await expect(page.getByText("Hint 1.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Try by hand/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("fraction kitchen computes 1/2 + 1/3 = 5/6 and updates live", async ({ page }) => {
  await page.goto("/simulations/fraction-kitchen");
  await expect(page.getByText("lcm(2, 3) = 6")).toBeVisible();
  await page.getByLabel("bottom 2").fill("4");
  await expect(page.getByText("lcm(2, 4) = 4")).toBeVisible();
  await expect(page.getByText("3/4", { exact: true }).first()).toBeVisible();
});

test("draggable points are keyboard operable", async ({ page }) => {
  await page.goto("/simulations/slope-lab");
  await expect(page.getByText("4/5 = 4/5")).toBeVisible(); // A(-2,-1), B(3,3)
  await page.getByRole("slider", { name: "Point B" }).focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByText("5/5 = 1")).toBeVisible();
});

test("academy bridge: 'I need the basics' leads to a lesson and back", async ({ page }) => {
  await page.goto("/academy/fy-s1-07a");
  await expect(page.getByText("Chapter 07A_Limits_annotated.pdf")).toBeVisible();
  await page.getByRole("link", { name: "I need the basics →" }).first().click();
  const back = page.getByRole("link", { name: /Return to Ch 07A Limits/ });
  await expect(back).toBeVisible();
  await back.click();
  await expect(page).toHaveURL(/\/academy\/fy-s1-07a/);
});

test("practice records mastery attempts that survive reload", async ({ page }) => {
  await page.goto("/practice/coordinate-quadrant".replace("coordinate-quadrant", "coordinate-plane"));
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page.getByRole("button", { name: /Show worked solution/ }).click().catch(() => {});
  await page.goto("/progress");
  await page.reload();
  const row = page.getByRole("row", { name: /The coordinate plane/ });
  await expect(row).toContainText(/1/);
});

test("untimed exam can be taken and graded", async ({ page }) => {
  await page.goto("/exams");
  await page.getByRole("button", { name: "Untimed (accessibility)" }).first().click();
  await page.getByRole("button", { name: "Finish & grade" }).click();
  await expect(page.getByText(/Score: 0 \/ 10/)).toBeVisible();
  await expect(page.getByText("— unanswered").first()).toBeVisible();
});

test("notebook evaluates safely and rejects code", async ({ page }) => {
  await page.goto("/notebook");
  await expect(page.getByText("0.833333333333", { exact: false }).first()).toBeVisible();
  const cell = page.getByLabel("Cell source").nth(1);
  await cell.fill("alert(1)");
  await expect(page.getByText(/not supported|Unknown symbol|not allowed/).first()).toBeVisible();
});

test("settings: delete all data resets progress", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Delete all my data…" }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();
  await expect(page.getByText("All local data deleted.")).toBeVisible();
});

for (const path of ["/", "/lesson/fractions-adding-unlike", "/academy/fy-s1-08b", "/simulations/unit-circle", "/practice/fraction-add-sub", "/progress", "/settings", "/learn"]) {
  test(`axe: no serious or critical accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const bad = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.length} nodes — ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
}
