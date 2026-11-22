import { test, expect } from '@playwright/test';
for (const [width, height] of [
  [320, 568],
  [390, 844],
  [844, 390],
  [955, 590],
  [1366, 768],
])
  for (const locale of ['en', 'ar', 'arz']) {
    test(`header alignment ${width}×${height} ${locale}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
      await page.evaluate(`mainMenu.style.display='none';window.reeoI18n.setLocale('${locale}')`);
      await expect(page.locator('.reeo-touch-tools')).toBeVisible();
      const measurements = await page.evaluate(() => {
        const tools = document.querySelector('.reeo-touch-tools')?.getBoundingClientRect();
        const actions = document.querySelector('.reeo-platform-bar')?.getBoundingClientRect();
        if (!tools || !actions) throw new Error('Missing header controls');
        return {
          sameRow: Math.abs(tools.top - actions.top) < 1,
          equalHeight: Math.abs(tools.height - actions.height) < 1,
          stacked: actions.top >= tools.bottom + 7,
          inside: [tools, actions].every(
            (r) =>
              r.left >= 11 && r.right <= innerWidth - 11 && r.top >= 11 && r.bottom <= innerHeight,
          ),
          overlap:
            tools.left < actions.right &&
            tools.right > actions.left &&
            tools.top < actions.bottom &&
            tools.bottom > actions.top,
        };
      });
      expect(measurements.inside).toBe(true);
      expect(measurements.overlap).toBe(false);
      if (width >= 955) {
        expect(measurements.sameRow).toBe(true);
        expect(measurements.equalHeight).toBe(true);
      } else expect(measurements.sameRow || measurements.stacked).toBe(true);
      for (const control of await page
        .locator('.reeo-editor-header button:visible, .reeo-editor-header select')
        .all()) {
        const box = await control.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(43.9);
        expect(box?.height).toBeGreaterThanOrEqual(43.9);
      }
    });
  }

test('home footer credits the developer and links name and icon to the repository', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  const credit = page.locator('.reeo-credit');
  await expect(credit).toBeVisible();
  const link = credit.locator('a.reeo-credit-link');
  await expect(link).toContainText('Developer');
  await expect(link).toContainText('Abdou-da0wew');
  await expect(link).toHaveAttribute('href', 'https://github.com/abdou-da0wew/REEO');
  await expect(link).toHaveAttribute('target', '_blank');
  expect((await link.getAttribute('rel')) ?? '').toContain('noopener');
  await expect(link.locator('.reeo-credit-icon')).toBeVisible();
  const box = await link.boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 390 && box.y + box.height <= 844).toBe(true);
  // Name and icon share the one anchor, so either click reaches the repository.
  await page.evaluate(`mainMenu.style.display='none'`);
  await expect(credit).toBeHidden();
  await page.evaluate(`mainMenu.style.display='block'`);
  await expect(credit).toBeVisible();
  await page.evaluate(`window.reeoI18n.setLocale('ar')`);
  await expect(link).toContainText('المطوّر');
  await expect(link).toContainText('Abdou-da0wew');
});
