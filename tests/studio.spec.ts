import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function createBoard(page: Page, name = 'My REEO circuit') {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.locator('.main-menu > button').first().click();
  await page.getByPlaceholder('Board name').fill(name);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.main-menu')).toBeHidden();
  // The original first-run welcome is intentionally preserved.
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.locator('#dialog .close').click();
  await expect(page.getByRole('dialog')).toBeHidden();
}

test('preserves the original menu, fonts, canvas, and gate toolbar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await createBoard(page);
  await expect(page.locator('#canvas')).toBeVisible();
  await expect(page.locator('#toolbar .slot')).toHaveCount(7);
  expect(
    await page.locator('.main-menu').evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe('rgb(17, 17, 17)');
  await page.evaluate('select(Input)');
  await page.locator('#canvas').click({ position: { x: 300, y: 250 } });
  expect(await page.evaluate('components.length')).toBe(1);
  expect(await page.evaluate('components[0].value')).toBe(0);
  await page.locator('#canvas').click({ position: { x: 300, y: 250 } });
  expect(await page.evaluate('components[0].value')).toBe(1);
  expect(errors).toEqual([]);
});

test('runs the actual original gates with the typed simulation scheduler', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  for (const [kind, expected] of [
    ['AND', [0, 0, 0, 1]],
    ['OR', [0, 1, 1, 1]],
    ['XOR', [0, 1, 1, 0]],
  ] as const) {
    const result = await page.evaluate(
      `(() => { const gate = new ${kind}(); return [[0,0],[0,1],[1,0],[1,1]].map(([a,b]) => { gate.input[0].value=a; gate.input[1].value=b; gate.update(); return gate.output[0].value; }); })()`,
    );
    expect(result).toEqual(expected);
  }
});

test('exports an original-format board and persists even an empty board', async ({ page }) => {
  await createBoard(page, 'Backup test');
  await page.evaluate('window.reeo.quit()');
  const saved = await page.evaluate(
    "JSON.parse(localStorage.getItem('reeo.files.v1:saves/backup-test.board'))",
  );
  expect(saved.name).toBe('Backup test');
  expect(JSON.parse(saved.data)).toEqual([[], []]);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#reeo-export').click();
  expect((await downloadPromise).suggestedFilename()).toBe('Backup-test.board');
});

test('switches English, Arabic, and Egyptian Arabic with persistent RTL', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Language', { exact: true }).selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.main-menu > button').first()).toContainText('لوحة جديدة');
  await page.locator('#reeo-language').selectOption('arz');
  await page.evaluate(`mainMenu.style.display='none'`);
  await page.locator('#reeo-help').click();
  await expect(page.locator('#reeo-help-panel')).toContainText('دليل بناء الدواير');
  await page.locator('#reeo-help-panel header button').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'arz');
  await page.locator('#reeo-language').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('.main-menu > button').first()).toContainText('NEW BOARD');
});

for (const [name, width, height] of [
  ['phone', 390, 844],
  ['tablet', 800, 1280],
  ['laptop', 1366, 768],
] as const) {
  test(`${name}: menu fits and the original canvas supports editing`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await createBoard(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate('select(Input)');
    await page.locator('#canvas').click({ position: { x: 200, y: 300 } });
    expect(await page.evaluate('components.length')).toBe(1);
    if (width < 901) await expect(page.locator('.reeo-touch-tools')).toBeVisible();
  });
}

test('touch pointer events place and toggle a gate without mouse-only shortcuts', async ({
  page,
}) => {
  await createBoard(page);
  await page.evaluate('select(Input)');
  const canvas = page.locator('#canvas');
  await canvas.tap({ position: { x: 300, y: 250 } });
  await canvas.tap({ position: { x: 300, y: 250 } });
  expect(await page.evaluate('components.length')).toBe(1);
  expect(await page.evaluate('components[0].value')).toBe(1);
});

test('imports an exported board and leaves the circuit intact on invalid import', async ({
  page,
}) => {
  await createBoard(page, 'Round trip');
  await page.evaluate('select(Input)');
  await page.locator('#canvas').click({ position: { x: 300, y: 250 } });
  await page.evaluate('window.reeo.quit()');
  const saved: string = await page.evaluate(
    "localStorage.getItem('reeo.files.v1:saves/round-trip.board')",
  );
  const choose = page.waitForEvent('filechooser');
  await page.locator('#reeo-import').click();
  await (
    await choose
  ).setFiles({
    name: 'Round-trip.board',
    mimeType: 'application/json',
    buffer: Buffer.from(saved),
  });
  await expect(page).toHaveTitle('Round trip - REEO');
  expect(await page.evaluate('components.length')).toBe(1);
  const bad = page.waitForEvent('filechooser');
  await page.locator('#reeo-import').click();
  await (
    await bad
  ).setFiles({ name: 'bad.board', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.locator('#toast')).toContainText('Unable to import this board');
  expect(await page.evaluate('components.length')).toBe(1);
});

test('Ctrl+N and Ctrl+O open their menus without clearing the circuit', async ({ page }) => {
  await createBoard(page);
  await page.evaluate('select(Input)');
  await page.locator('#canvas').click({ position: { x: 300, y: 250 } });
  expect(await page.evaluate('components.length')).toBe(1);

  await page.locator('#canvas').focus();
  await page.keyboard.press('Control+O');
  await expect(page.locator('.main-menu .open-board')).toBeVisible();
  expect(await page.evaluate('components.length')).toBe(1);

  await page.evaluate('mainMenu.hide()');
  await page.locator('#canvas').focus();
  await page.keyboard.press('Control+N');
  await expect(page.locator('.main-menu .new-board')).toBeVisible();
  expect(await page.evaluate('components.length')).toBe(1);
});
