import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function editor(page: Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.locator('.main-menu > button').first().click();
  await page.getByPlaceholder('Board name').fill('Circuit icons');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page.locator('#dialog .close').click();
}

for (const [name, width, height, locale] of [
  ['phone', 390, 844, 'en'],
  ['tablet Arabic', 800, 1280, 'ar'],
  ['laptop Egyptian', 1366, 768, 'arz'],
] as const) {
  test(`${name}: tips stack at bottom right, stay put, and dismiss`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await editor(page);
    await page.evaluate(
      `window.reeoI18n.setLocale('${locale}'); tips.dragging.show(); tips.connecting_shift.show();`,
    );
    const first = page.locator('#dragging');
    const second = page.locator('#connecting_shift');
    await expect(first).toBeVisible();
    await expect(second).toBeVisible();
    await page.locator('#reeo-toast-stack').evaluate(async (stack) => {
      await Promise.all(
        stack.getAnimations({ subtree: true }).map((animation) => animation.finished),
      );
    });
    const box = await first.boundingBox();
    const next = await second.boundingBox();
    expect(box && next).toBeTruthy();
    if (!box || !next) throw new Error('Missing toast');
    expect(box.x).toBeGreaterThanOrEqual(15);
    expect(box.x + box.width).toBeLessThanOrEqual(width - 15);
    expect(next.y).toBeGreaterThanOrEqual(box.y + box.height);
    expect(next.y + next.height).toBeLessThanOrEqual(height - 75);
    await page.mouse.move(12, 160);
    const stable = await first.boundingBox();
    expect(stable?.x).toBe(box.x);
    expect(stable?.y).toBe(box.y);
    await first.locator('button').click();
    await expect(first).toBeHidden();
    await expect(second).toBeVisible();
  });
}

test('Phosphor UI and circuit symbols load without changing gate interaction', async ({ page }) => {
  await editor(page);
  await expect(page.locator('#toolbar > .slot .reeo-circuit-icon')).toHaveCount(6);
  await expect(page.locator('#reeo-import .reeo-ui-icon')).toHaveAttribute(
    'data-icon',
    'upload-simple',
  );
  await expect(page.locator('#reeo-zoom-in')).toHaveAttribute('data-icon', 'magnifying-glass-plus');
  await page.getByRole('button', { name: 'NOT gate', exact: true }).click();
  await page.mouse.click(300, 300);
  expect(await page.evaluate('components[0].constructor.name')).toBe('NOT');
  await page.getByRole('button', { name: 'AND gate', exact: true }).click({ button: 'right' });
  await expect(page.locator('#dialog .reeo-circuit-icon')).toHaveCount(1);
  await expect(page.locator('#dialog .truthtable tr')).toHaveCount(5);
});

test('Arabic and Egyptian localize every tutorial paragraph and dynamic dialogs reversibly', async ({
  page,
}) => {
  await editor(page);
  for (const locale of ['ar', 'arz']) {
    await page.evaluate(`window.reeoI18n.setLocale('${locale}')`);
    const untranslated = await page
      .locator('.tutorial p')
      .evaluateAll((paragraphs) =>
        paragraphs
          .map((p) => p.textContent?.trim() ?? '')
          .filter((text) => text && !/[\u0600-\u06ff]/.test(text)),
      );
    expect(untranslated).toEqual([]);
    await page.evaluate(`dialog.editComponent(new Clock('اسم تجريبي',{x:0,y:0}));`);
    await expect(page.locator('#dialog h1')).toHaveText(
      locale === 'ar' ? 'تعديل المكوّن' : 'عدّل المكوّن',
    );
    await expect(page.locator('#dialog .container')).not.toContainText('Name:');
    await expect(page.locator('#dialog .container')).not.toContainText('Width:');
    await page.locator('#dialog .close').click();
    await page.evaluate(`reeoConsole.help(); toolbar.message('Selected Input gate');`);
    await expect(page.locator('#toast')).not.toContainText('Input');
    await expect(page.locator('.console .log').first()).not.toContainText('sets a variable');
    await page.evaluate(`dialog.savedCustomComponents()`);
    await expect(page.locator('#dialog .container')).not.toContainText('You have no');
    await page.locator('#dialog .close').click();
  }
  await page.evaluate(`window.reeoI18n.setLocale('en')`);
  await expect(page.locator('.tutorial p').first()).toContainText(
    'Welcome to your first REEO board',
  );
  await expect(page.locator('.tutorial code').first()).toContainText('set example 200');
});

test('Arabic font is local and Unicode-restricted without replacing Latin glyphs', async ({
  page,
}) => {
  await editor(page);
  const fonts = await page.evaluate(async () => {
    await document.fonts.load('400 18px "REEO Arabic"', 'مرحبا');
    const result: string[] = [];
    document.fonts.forEach((font) => {
      if (font.family.includes('REEO Arabic') && font.status === 'loaded')
        result.push(font.unicodeRange);
    });
    return result;
  });
  expect(fonts.length).toBeGreaterThan(0);
  expect(fonts.every((range) => range.includes('600-6FF') && !range.includes('0-10FFFF'))).toBe(
    true,
  );
});

test('toast lifetime pauses on hover and respects reduced motion', async ({ page }) => {
  await editor(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.evaluate(`tips.dragging.show()`);
  const tip = page.locator('#dragging');
  await tip.hover();
  await page.clock.fastForward(9000);
  await expect(tip).toBeVisible();
  expect(await tip.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await page.mouse.move(10, 160);
  await page.clock.fastForward(8100);
  await expect(tip).toBeHidden();
});

test('all legacy dialog flows have localized authored prose in both Arabic locales', async ({
  page,
}) => {
  await page.route('https://api.github.com/**', (route) => route.abort('failed'));
  await editor(page);
  await page.evaluate(`window.auditGate=new AND('TestName',{x:0,y:0})`);
  for (const locale of ['ar', 'arz']) {
    await page.evaluate(`window.reeoI18n.setLocale('${locale}')`);
    for (const call of [
      'dialog.welcome()',
      'dialog.createBoard()',
      'dialog.update()',
      'dialog.openBoard()',
      'dialog.connectToServer()',
      'dialog.connections(window.auditGate)',
      'dialog.truthTable(AND)',
      'dialog.settings()',
      'dialog.editName(window.auditGate)',
      'dialog.colorPicker()',
      'dialog.editPort(window.auditGate.input[0])',
      'dialog.editCustom(window.auditGate)',
      'dialog.savedCustomComponents()',
      'dialog.save()',
      'dialog.editComponent(window.auditGate)',
      'dialog.editDelay(window.auditGate)',
      'dialog.editRom(window.auditGate)',
    ]) {
      await page.evaluate(call);
      const leftover = await page.locator('#dialog').evaluate((dialog) => {
        const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
        const result: string[] = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const text = node.textContent?.trim() ?? '';
          if (node.parentElement?.closest('script,style,svg,.material-icons,[data-no-i18n]'))
            continue;
          if (
            /[A-Za-z]{3}/.test(text) &&
            !/[\u0600-\u06ff]/.test(text) &&
            !['REEO', 'TestName', '.board'].includes(text)
          )
            result.push(text);
        }
        return result;
      });
      expect(leftover, `${locale}: ${call}`).toEqual([]);
    }
  }
});
