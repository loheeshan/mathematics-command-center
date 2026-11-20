import { test, expect } from "@playwright/test";
import path from 'node:path';

test("360px: menu opens, lesson and lab are usable without horizontal page scroll", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Course & search/ }).click();
  await expect(page.locator("#course-nav")).toBeVisible();
  for (const p of ["/", "/paths", "/?lesson=derivatives", "/notebook", "/lesson/fractions-adding-unlike", "/simulations/fraction-kitchen", "/academy/fy-s1-08b"]) {
    await page.goto(p);
    if(p==='/' || p.startsWith('/?')) await expect(page.locator('.learning-layout')).toHaveAttribute('aria-busy','false');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, p).toBeLessThanOrEqual(1);
    if(process.env.PREVIEW_OUTPUT && p==='/') await page.screenshot({path:path.join(process.env.PREVIEW_OUTPUT,'math-notebook-mobile.png'),fullPage:true});
  }
});
