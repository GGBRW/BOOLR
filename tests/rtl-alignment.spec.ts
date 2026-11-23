import { test, expect } from '@playwright/test';
for (const locale of ['en', 'ar', 'arz'])
  test(`${locale}: menu rows keep icon, label, shortcut columns separated`, async ({ page }) => {
    await page.setViewportSize({ width: 955, height: 590 });
    await page.goto('/');
    await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
    await page.evaluate(
      `mainMenu.style.display='none';window.reeoI18n.setLocale('${locale}');menu.show()`,
    );
    for (const selector of ['#menu', '#contextMenu']) {
      if (selector === '#contextMenu')
        await page.evaluate(`components=[new AND('Gate',{x:3,y:-3})];contextMenu.show(3,-3)`);
      const result = await page.locator(`${selector} > li`).evaluateAll((rows) =>
        rows.map((row) => {
          const icon = row.querySelector('.material-icons')?.getBoundingClientRect();
          const label = row.querySelector('.reeo-menu-label')?.getBoundingClientRect();
          const key = row.querySelector('.key,.reeo-menu-key')?.getBoundingClientRect();
          if (!icon || !label) throw new Error('Missing menu columns');
          const rtl = document.documentElement.dir === 'rtl';
          return {
            ordered: rtl ? icon.left >= label.right - 1 : icon.right <= label.left + 1,
            keyClear:
              !key ||
              key.width === 0 ||
              (rtl ? key.right <= label.left + 1 : key.left >= label.right - 1),
            iconX: icon.x,
            direction: row.querySelector('.key,.reeo-menu-key')
              ? getComputedStyle(row.querySelector('.key,.reeo-menu-key') as Element).direction
              : 'ltr',
          };
        }),
      );
      expect(result.every((row) => row.ordered && row.keyClear && row.direction === 'ltr')).toBe(
        true,
      );
      expect(new Set(result.map((row) => Math.round(row.iconX))).size).toBe(1);
    }
    await page.evaluate('contextMenu.hide();list.show()');
    const columns = await page.locator('#list > li').evaluateAll((rows) =>
      rows.map((row) => {
        const icon = row.querySelector('.reeo-circuit-icon')?.getBoundingClientRect();
        const help = row.querySelector('button')?.getBoundingClientRect();
        if (!icon || !help) throw new Error('Missing picker columns');
        return [Math.round(icon.x), Math.round(help.x)];
      }),
    );
    expect(new Set(columns.map((row) => row[0])).size).toBe(1);
    expect(new Set(columns.map((row) => row[1])).size).toBe(1);
  });
test('language choices use the editor menu and support keyboard selection and outside dismissal', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.evaluate(`mainMenu.style.display='none'`);
  await page.locator('#reeo-language').click();
  await expect(page.locator('#reeo-language-menu')).toBeVisible();
  await page
    .locator('#reeo-language-menu')
    .getByRole('option', { name: 'مصري', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'arz');
  await expect(page.locator('#reeo-language-menu')).toBeHidden();
  await page.locator('#reeo-language').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#reeo-language-menu')).toBeVisible();
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.locator('#reeo-language').click();
  await page.mouse.click(500, 300);
  await expect(page.locator('#reeo-language-menu')).toBeHidden();
});

test('RTL navigation remains aligned above its right-edge trigger', async ({ page }) => {
  await page.setViewportSize({ width: 955, height: 590 });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.evaluate(`mainMenu.style.display='none';window.reeoI18n.setLocale('arz')`);
  await page.locator('#menuopen').click();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const menu = document.getElementById('menu')?.getBoundingClientRect();
        const button = document.getElementById('menuopen')?.getBoundingClientRect();
        return menu && button ? Math.abs(menu.right - button.right) : 999;
      }),
    )
    .toBeLessThanOrEqual(3);
});
