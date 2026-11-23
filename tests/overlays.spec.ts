import { test, expect } from '@playwright/test';
async function boot(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.evaluate(`mainMenu.style.display='none'`);
}
test('What’s new lives in navigation and has a compact release dialog', async ({ page }) => {
  await page.route('https://api.github.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tag_name: 'v9.9.9',
        name: 'REEO v9.9.9',
        body: '## Highlights\n- Dynamic release notes from GitHub\n- Cached for offline use\n### Fixed\n- Removed the hardcoded list',
        html_url: 'https://github.com/abdou-da0wew/REEO/releases/tag/v9.9.9',
        published_at: '2026-11-21T00:00:00Z',
      }),
    }),
  );
  await boot(page);
  await expect(page.locator('.brbtns #version')).toHaveCount(0);
  await page.locator('#menuopen').click();
  await page.locator('#reeo-whats-new').click();
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog h1')).toHaveText("What's new");
  await expect(page.locator('#dialog')).toContainText('REEO v9.9.9');
  await expect(page.locator('#dialog li')).toHaveCount(3);
  await expect(page.locator('#dialog')).toContainText('Dynamic release notes from GitHub');
  await expect(page.locator('#dialog')).toContainText('Cached for offline use');
  await expect(page.locator('#dialog')).toContainText('Removed the hardcoded list');
  const cached = await page.evaluate(() => localStorage.getItem('reeo.release.v1'));
  expect(cached).toContain('v9.9.9');
  const r = await page.locator('#dialog').boundingBox();
  expect(r?.width).toBeLessThanOrEqual(420);
  expect(r?.height).toBeLessThan(520);
  const viewport = page.viewportSize();
  expect(r && viewport && r.y >= 0 && r.y + r.height <= viewport.height).toBe(true);
  await page.mouse.click(8, 8);
  await expect(page.locator('#dialog')).toBeHidden();
  await page.locator('#menuopen').click();
  await expect(page.locator('#menu')).toHaveCSS('opacity', '1');
});
test('release notes fall back cleanly when the public API is unreachable', async ({ page }) => {
  await page.route('https://api.github.com/**', (route) => route.abort('failed'));
  await boot(page);
  await page.evaluate('dialog.update()');
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog')).toContainText(
    "What's new now reads the latest public GitHub release",
  );
  await expect(page.locator('#dialog .reeo-release-source')).toHaveAttribute(
    'href',
    'https://github.com/abdou-da0wew/REEO/releases',
  );
});
test('long release notes scroll inside the compact dialog', async ({ page }) => {
  const items = Array.from({ length: 24 }, (_, index) => `- Release note ${index + 1}`).join('\n');
  await page.route('https://api.github.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tag_name: 'v9.9.9',
        name: 'REEO v9.9.9',
        body: `## Highlights\n${items}\n### Fixes\n- Final fix`,
        html_url: 'https://github.com/abdou-da0wew/REEO/releases/tag/v9.9.9',
        published_at: '2026-11-21T00:00:00Z',
      }),
    }),
  );
  await boot(page);
  await page.evaluate('dialog.update()');
  await expect(page.locator('#dialog li')).toHaveCount(25);
  const r = await page.locator('#dialog').boundingBox();
  expect(r?.height).toBeLessThan(520);
  await expect(page.locator('#dialog .options button')).toBeVisible();
  const scrolled = await page
    .locator('#dialog .container')
    .evaluate((el) => el.scrollHeight > el.clientHeight);
  expect(scrolled).toBe(true);
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
