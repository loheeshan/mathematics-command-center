import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';
import { JOURNEY } from '../../packages/curriculum/src/journey';

test('exploration, checks and snapshots persist independently', async ({page})=>{
  await page.goto('/?lesson=counting');
  await expect(page.getByRole('heading',{level:1})).toHaveText('What is a number?');
  await page.getByRole('slider',{name:'Number of objects'}).fill('9');
  await expect(page.locator('.visual-result')).toContainText('9 objects');
  await expect(page.locator('.course-summary')).toContainText('0 of 24');
  await page.getByRole('button',{name:'Check',exact:true}).click();
  await page.getByLabel('Your answer').fill('8');
  await page.getByRole('button',{name:'Check understanding'}).click();
  await expect(page.locator('.feedback[role="status"]')).toContainText('Not quite');
  await expect(page.locator('.course-summary')).toContainText('0 of 24');
  await page.getByLabel('Your answer').fill('7');
  await page.getByRole('button',{name:'Check understanding'}).click();
  await expect(page.locator('.feedback[role="status"]')).toContainText('Correct');
  await expect(page.locator('.course-summary')).toContainText('1 of 24');
  await page.getByRole('button',{name:'Reflect',exact:true}).click();
  await page.getByLabel('My understanding').fill('Rearranging nine objects keeps the count at nine.');
  await page.getByRole('button',{name:'Save note & visual'}).click();
  await page.getByRole('link',{name:'My notebook',exact:true}).click();
  await expect(page.getByText('Rearranging nine objects keeps the count at nine.')).toBeVisible();
  await page.getByRole('link',{name:'Reopen this visual'}).click();
  await expect(page.getByRole('slider',{name:'Number of objects'})).toHaveValue('9');
  await page.reload();
  await expect(page.locator('.course-summary')).toContainText('1 of 24');
  await expect(page.getByRole('slider',{name:'Number of objects'})).toHaveValue('9');
});

test('role paths, search and browser back use real lesson navigation',async({page})=>{
  await page.goto('/paths');
  await page.getByRole('article').filter({has:page.getByRole('heading',{name:'Data engineer',exact:true})}).getByRole('link').click();
  await expect(page.getByLabel('Learning path',{exact:true})).toHaveValue('data-engineer');
  await page.getByLabel('Search guided lessons').fill('variance');
  // Search the actual concept wording as well as lesson titles.
  await page.getByRole('button',{name:/How spread out is the data/}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('How spread out is the data?');
  await page.goBack();
  await expect(page.getByRole('heading',{level:1})).toHaveText('What is a number?');
});

test('all guided lessons render at parameter boundaries without errors',async({page})=>{
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  for(const lesson of JOURNEY){
    await page.goto(`/?lesson=${lesson.id}&a=${lesson.params[0].max}&b=${lesson.params[1].max}`);
    await expect(page.getByRole('heading',{level:1})).toHaveText(lesson.title);
    await expect(page.locator('.visual-result')).not.toContainText(/NaN|Infinity/);
    await page.getByRole('button',{name:'Reset',exact:true}).click();
    await expect(page.getByRole('slider').first()).toHaveValue(String(lesson.params[0].initial));
  }
  expect(errors).toEqual([]);
});

test('malformed deep links fall back safely',async({page})=>{
  await page.goto('/?lesson=missing&step=999&a=Infinity&b=-999&path=missing');
  await expect(page.getByRole('heading',{level:1})).toHaveText('What is a number?');
  await expect(page.getByRole('slider').first()).toHaveValue('6');
  await expect(page.getByRole('slider').nth(1)).toHaveValue('2');
  await expect(page.getByLabel('Learning path',{exact:true})).toHaveValue('everyone');
});

for(const theme of ['light','dark']) test(`guided UI passes axe in ${theme} theme`,async({page})=>{
  await page.goto('/');
  if(theme==='dark')await page.getByRole('button',{name:'Switch to dark theme'}).click();
  for(const route of ['/?lesson=counting','/?lesson=fractions&step=2','/paths','/notebook']){
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(result.violations.map(v=>`${v.id}: ${v.nodes.map(n=>n.target).join(',')}`),route).toEqual([]);
    if(process.env.PREVIEW_OUTPUT && route==='/?lesson=counting') await page.screenshot({path:path.join(process.env.PREVIEW_OUTPUT,`math-notebook-${theme}.png`),fullPage:true});
  }
});
