import { test, expect } from '@playwright/test';

test('type specimen serves the shipped font and exposes its features', async ({ page }) => {
  await page.goto('/brand/font-specimen.html');
  await expect(page).toHaveTitle(/REEO Circuit Display/);

  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('32px "REEO Circuit"', 'REEO ÀéñŁžİşĲ');
  });
  expect(fontLoaded).toBe(true);

  const cells = page.locator('#charset .cell');
  expect(await cells.count()).toBeGreaterThanOrEqual(340);

  const labels = await page.locator('#charset .code').allTextContents();
  expect(labels).toEqual(
    expect.arrayContaining(['00C0', '0141', '017F', '1E9E', '2014', '201C', '2026', '20AC']),
  );

  await page.fill('#live-text', '0123');
  await page.check('#slash-zero');
  await expect(page.locator('#sample')).toHaveCSS('font-feature-settings', '"ss01"');
  await expect(page.locator('#sample')).toHaveText('0123');

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0);
});
