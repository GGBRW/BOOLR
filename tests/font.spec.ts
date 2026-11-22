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

test('home wordmark joins the circuit R to live REEO Circuit Display type', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const wordmark = page.locator('.reeo-wordmark');
  const letters = page.locator('.reeo-wordmark-letters');
  const mark = page.locator('.reeo-wordmark-r');

  await expect(wordmark).toHaveAttribute('aria-label', 'REEO');
  await expect(letters).toHaveText('EEO');
  await expect(letters).toHaveCSS('font-family', /REEO Circuit Display/);
  await expect(mark).toHaveAttribute('src', '/brand/reeo-r-mark.svg');

  const rendered = await page.evaluate(() => {
    const font = [...document.fonts].find((face) => face.family === 'REEO Circuit Display');
    const heading = document.querySelector<HTMLElement>('.reeo-wordmark');
    const markBox = document
      .querySelector<HTMLElement>('.reeo-wordmark-r')
      ?.getBoundingClientRect();
    const lettersBox = document
      .querySelector<HTMLElement>('.reeo-wordmark-letters')
      ?.getBoundingClientRect();
    if (!heading || !markBox || !lettersBox) return null;
    const fontSize = parseFloat(getComputedStyle(heading).fontSize);
    return {
      fontStatus: font?.status,
      fontSize,
      markHeight: markBox.height,
      gap: lettersBox.left - markBox.right,
    };
  });

  expect(rendered).not.toBeNull();
  expect(rendered?.fontStatus).toBe('loaded');
  expect(rendered?.markHeight).toBeCloseTo((rendered?.fontSize ?? 0) * 0.7, 0);
  expect(Math.abs(rendered?.gap ?? 99)).toBeLessThan(0.01);

  await page.setViewportSize({ width: 320, height: 568 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0);
});
