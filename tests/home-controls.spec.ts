import { test, expect } from '@playwright/test';
for (const locale of ['en', 'ar', 'arz'])
  test(`${locale}: home hides editor actions and language menu joins its parent`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 970, height: 590 });
    await page.goto('/');
    await expect(page.locator('body')).toHaveAttribute('data-reeo-screen', 'home');
    await page.evaluate(`window.reeoI18n.setLocale('${locale}')`);
    for (const selector of [
      '.reeo-touch-tools',
      '#reeo-import',
      '#reeo-export',
      '#reeo-help',
      '#toolbar',
      '.brbtns',
    ])
      await expect(page.locator(selector)).toBeHidden();
    await expect(page.locator('#reeo-language')).toBeVisible();
    await page.locator('#reeo-language').click();
    await expect(page.locator('#reeo-language-menu')).toBeVisible();
    const geometry = await page.locator('.reeo-language-control').evaluate((el) => {
      const label = el.querySelector('label')?.getBoundingClientRect();
      const menu = el.querySelector<HTMLElement>('[role=listbox]');
      if (!label || !menu) throw new Error('Missing language control');
      const box = menu.getBoundingClientRect();
      const style = getComputedStyle(menu);
      return {
        left: box.left - label.left,
        right: box.right - label.right,
        gap: box.top - label.bottom,
        topRadius: style.borderTopLeftRadius,
        bottomRadius: style.borderBottomLeftRadius,
      };
    });
    expect(Math.abs(geometry.left)).toBeLessThan(1);
    expect(Math.abs(geometry.right)).toBeLessThan(1);
    expect(Math.abs(geometry.gap)).toBeLessThan(1);
    expect(geometry.topRadius).toBe('0px');
    expect(geometry.bottomRadius).toBe('5px');
    await page.keyboard.press('Escape');
    await expect(page.locator('#reeo-language-menu')).toBeHidden();
    await page.evaluate(`mainMenu.style.display='none'`);
    await expect(page.locator('.reeo-touch-tools')).toBeVisible();
    await expect(page.locator('#reeo-help')).toBeVisible();
    await page.evaluate('mainMenu.show()');
    await expect(page.locator('.reeo-touch-tools')).toBeHidden();
  });
