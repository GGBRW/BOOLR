import { test, expect } from '@playwright/test';
async function boot(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.evaluate(
    `mainMenu.style.display='none';window.picked=null;dialog.colorPicker(rgb=>window.picked=rgb)`,
  );
}
test('palette displays all twelve existing colors and keyboard selection returns exact RGB', async ({
  page,
}) => {
  await boot(page);
  const buttons = page.locator('.reeo-color-swatch');
  await expect(buttons).toHaveCount(12);
  for (const button of await buttons.all()) {
    const r = await button.boundingBox();
    expect(r?.width).toBeGreaterThanOrEqual(44);
    expect(r?.height).toBeGreaterThanOrEqual(44);
  }
  const red = page.getByRole('button', { name: 'Red', exact: true });
  await red.focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate('window.picked')).toEqual([255, 51, 51]);
  await expect(page.locator('#dialog')).toBeHidden();
});
test('wire context-menu color editing applies the selected color to the actual wire', async ({
  page,
}) => {
  await boot(page);
  await page.evaluate(
    `dialog.hide();wires=[new Wire([{x:3,y:-3},{x:4,y:-3},{x:5,y:-3},{x:6,y:-3}])];contextMenu.show(4,-3)`,
  );
  await page.locator('#contextMenu li').filter({ hasText: 'Edit color' }).click();
  await expect(page.locator('.reeo-color-palette')).toBeVisible();
  await page.getByRole('button', { name: 'Blue', exact: true }).click();
  expect(await page.evaluate('wires[0].color')).toEqual([51, 119, 255]);
});
for (const locale of ['en', 'ar', 'arz'])
  test(`phone palette fits and cancels without mutation: ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await boot(page);
    await page.evaluate(`window.reeoI18n.setLocale('${locale}')`);
    const palette = page.locator('.reeo-color-palette');
    const r = await palette.boundingBox();
    expect(r?.x).toBeGreaterThanOrEqual(12);
    expect((r?.x ?? 0) + (r?.width ?? 0)).toBeLessThanOrEqual(308);
    expect(await palette.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    if (locale !== 'en')
      expect(await page.locator('.reeo-color-swatch').first().getAttribute('aria-label')).toMatch(
        /[\u0600-\u06ff]/,
      );
    await page.keyboard.press('Escape');
    expect(await page.evaluate('window.picked')).toBeNull();
    await expect(page.locator('#dialog')).toBeHidden();
  });
