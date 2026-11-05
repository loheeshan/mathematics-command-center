import { test, expect } from "@playwright/test";

test("360px: menu opens, lesson and lab are usable without horizontal page scroll", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.locator("#mobile-nav")).toBeVisible();
  for (const p of ["/lesson/fractions-adding-unlike", "/simulations/fraction-kitchen", "/academy/fy-s1-08b"]) {
    await page.goto(p);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, p).toBeLessThanOrEqual(1);
  }
});
