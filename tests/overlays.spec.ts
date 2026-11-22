import { test, expect } from '@playwright/test';
async function boot(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.evaluate(`mainMenu.style.display='none'`);
}
test('What’s new lives in navigation and has a compact release dialog', async ({ page }) => {
  await boot(page);
  await expect(page.locator('.brbtns #version')).toHaveCount(0);
  await page.locator('#menuopen').click();
  await page.locator('#reeo-whats-new').click();
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog h1')).toHaveText("What's new");
  await expect(page.locator('#dialog li')).toHaveCount(5);
  const r = await page.locator('#dialog').boundingBox();
  expect(r?.width).toBeLessThanOrEqual(420);
  expect(r?.height).toBeLessThan(440);
  await page.mouse.click(8, 8);
  await expect(page.locator('#dialog')).toBeHidden();
  await page.locator('#menuopen').click();
  await expect(page.locator('#menu')).toHaveCSS('opacity', '1');
});
test('Quick guide is icon-only and opens a smaller centered field guide', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await boot(page);
  const button = page.locator('#reeo-help');
  await expect(button).toHaveAttribute('title', 'Quick guide');
  await expect(button).toHaveAttribute('aria-label', 'Quick guide');
  await expect(button.locator('[data-i18n]')).toHaveCount(0);
  expect((await button.boundingBox())?.width).toBe(52);
  await button.click();
  const r = await page.locator('#reeo-help-panel').boundingBox();
  expect(r?.width).toBe(760);
  expect(r?.height).toBe(660);
  expect(Math.abs((r?.x ?? 0) - 303)).toBeLessThan(1);
  await page.mouse.click(8, 8);
  await expect(page.locator('#reeo-help-panel')).toBeHidden();
});
for (const [selector, show] of [
  ['#dialog', 'dialog.settings()'],
  ['#menu', 'menu.show()'],
  ['#contextMenu', `contextMenu.show(3,-3)`],
  ['#list', 'list.show()'],
  ['.tutorial', 'tutorial.show()'],
  ['.console', 'reeoConsole.show()'],
  ['#componentInfo', `componentInfo.show(new AND('Details',{x:0,y:0}),{x:400,y:250})`],
  ['.main-menu .new-board', 'mainMenu.show();newBoardMenu.show()'],
])
  test(`${selector}: outside touch and Escape dismiss without saving`, async ({ page }) => {
    await boot(page);
    await page.evaluate(show);
    await expect(page.locator(selector)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(selector)).toBeHidden();
    await page.evaluate(show);
    await expect(page.locator(selector)).toBeVisible();
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');
    await page.touchscreen.tap(viewport.width - 8, viewport.height / 2);
    await expect(page.locator(selector)).toBeHidden();
  });
test('opening a new surface closes the previous popup, including the guide', async ({ page }) => {
  await boot(page);
  await page.evaluate(`menu.show();dialog.update()`);
  await expect(page.locator('#menu')).toBeHidden();
  await expect(page.locator('#dialog')).toBeVisible();
  await page.evaluate(`window.reeoHelp.open()`);
  await expect(page.locator('#dialog')).toBeHidden();
  await expect(page.locator('#reeo-help-panel')).toBeVisible();
  await page.evaluate('contextMenu.show(3,-3)');
  await expect(page.locator('#reeo-help-panel')).toBeHidden();
  await expect(page.locator('#contextMenu')).toBeVisible();
});
test('grid and toolbar tooltips stay dismissed on Escape until a new hover', async ({ page }) => {
  await boot(page);
  await page.evaluate(`hoverBalloon.show(new Input('Tooltip test',{x:3,y:-3}))`);
  await expect(page.locator('#hoverBalloon')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#hoverBalloon')).toBeHidden();
  await page.waitForTimeout(250);
  await expect(page.locator('#hoverBalloon')).toBeHidden();
  await page.locator('#toolbar > .slot').nth(2).hover();
  await expect(page.locator('#toolbartip')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#toolbartip')).toBeHidden();
});
test('outside dismissal never applies an edited value', async ({ page }) => {
  await boot(page);
  await page.evaluate(
    `window.editedPart=new Constant('zero',{x:0,y:0});window.editedPart.value=0;dialog.editComponent(window.editedPart)`,
  );
  await page.keyboard.press('Escape');
  expect(await page.evaluate('window.editedPart.value')).toBe(0);
});
