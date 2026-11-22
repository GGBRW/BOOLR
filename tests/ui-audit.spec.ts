import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function start(page: Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.locator('.main-menu > button').first().click();
  await page.getByPlaceholder('Board name').fill('Interaction audit');
  const panel = await page.locator('.new-board').boundingBox();
  const size = page.viewportSize();
  expect(
    panel &&
      size &&
      panel.x >= 0 &&
      panel.y >= 0 &&
      panel.x + panel.width <= size.width &&
      panel.y + panel.height <= size.height,
  ).toBe(true);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('#dialog')).toBeVisible();
  await page.locator('#dialog .close').click();
}
async function input(page: Page, x = 200, y = 300) {
  await page.getByRole('button', { name: 'Input and output ports' }).click();
  await page
    .locator('#list li')
    .filter({ hasText: /^Input$/ })
    .click();
  await page.mouse.click(x, y);
  expect(await page.evaluate('components.length')).toBe(1);
}
async function drag(page: Page, from: [number, number], to: [number, number]) {
  await page.mouse.move(...from);
  await page.mouse.down();
  await page.mouse.move(...to, { steps: 12 });
  await page.mouse.up();
}

for (const [device, width, height] of [
  ['phone', 390, 844],
  ['tablet', 800, 1280],
  ['laptop', 1366, 768],
] as const) {
  test(`${device}: context menus stay at the requested anchor and within the viewport`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await start(page);
    for (const [x, y] of [
      [12, 170],
      [width - 12, 170],
      [12, height - 160],
      [width - 12, height - 160],
    ] as const) {
      await page.mouse.click(x, y, { button: 'right' });
      await expect(page.locator('#contextMenu')).toBeVisible();
      const box = await page.locator('#contextMenu').boundingBox();
      expect(box).not.toBeNull();
      if (!box) throw new Error('Missing context menu');
      expect(box.x).toBeGreaterThanOrEqual(7);
      expect(box.y).toBeGreaterThanOrEqual(7);
      expect(box.x + box.width).toBeLessThanOrEqual(width - 7);
      expect(box.y + box.height).toBeLessThanOrEqual(height - 7);
      expect(Math.min(Math.abs(box.x - x), Math.abs(box.x + box.width - x))).toBeLessThan(10);
      await page.mouse.click(width / 2, height / 2);
    }
  });
}

test('visible Move, Pan, Select, and zoom tools work with a mouse', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await start(page);
  await input(page);
  await page.getByRole('button', { name: 'Move', exact: true }).click();
  await drag(page, [200, 300], [300, 400]);
  await expect
    .poll(() => page.evaluate('({x:components[0].pos.x,y:components[0].pos.y})'))
    .toEqual({ x: 3, y: -4 });
  expect(await page.evaluate('components[0].value')).toBe(0);
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await drag(page, [220, 330], [520, 470]);
  await expect.poll(() => page.evaluate('selecting?.components?.length')).toBe(1);
  await page.getByRole('button', { name: 'Pan', exact: true }).click();
  const before = await page.evaluate('offset.x');
  await drag(page, [900, 500], [1000, 550]);
  await expect.poll(() => page.evaluate('offset.x')).toBeLessThan(before);
  const z = await page.evaluate('zoom');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect.poll(() => page.evaluate('zoom')).toBeGreaterThan(z + 10);
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await expect.poll(() => page.evaluate('Math.round(zoom)')).toBe(Math.round(z));
});

test('real touch drags move components and pan without duplicate toggles', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1000 });
  await start(page);
  await input(page);
  const session = await page.context().newCDPSession(page);
  async function touchDrag(from: [number, number], to: [number, number]) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: from[0], y: from[1], id: 1 }],
    });
    for (let step = 1; step <= 12; step++)
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          {
            x: from[0] + ((to[0] - from[0]) * step) / 12,
            y: from[1] + ((to[1] - from[1]) * step) / 12,
            id: 1,
          },
        ],
      });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await page.getByRole('button', { name: 'Move', exact: true }).tap();
  await touchDrag([200, 300], [300, 400]);
  await expect.poll(() => page.evaluate('components[0].pos.x')).toBe(3);
  expect(await page.evaluate('components[0].value')).toBe(0);
  await page.getByRole('button', { name: 'Pan', exact: true }).tap();
  await touchDrag([550, 600], [650, 650]);
  await expect.poll(() => page.evaluate('offset.x')).toBeLessThan(0);
});

test('place, connect and simulate a circuit using actual toolbar and pointer interactions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await start(page);
  await input(page);
  await page.getByRole('button', { name: 'Input and output ports' }).click();
  await page
    .locator('#list li')
    .filter({ hasText: /^Output$/ })
    .click();
  await page.mouse.click(700, 300);
  expect(await page.evaluate('components.length')).toBe(2);
  await drag(page, [400, 300], [600, 300]);
  await expect.poll(() => page.evaluate('wires.length')).toBe(1);
  await page.mouse.click(200, 300);
  await expect.poll(() => page.evaluate('components[1].value')).toBe(1);
});

test('navigation opens above its button, resumes the board, and tutorial arrows work', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await input(page);
  await page.locator('#menuopen').click();
  await expect(page.locator('#menu')).toHaveCSS('opacity', '1');
  await expect
    .poll(async () => {
      const menu = await page.locator('#menu').boundingBox();
      const button = await page.locator('#menuopen').boundingBox();
      return !!menu && !!button && menu.y >= 0 && menu.y + menu.height <= button.y;
    })
    .toBe(true);
  await page.locator('#menu li').filter({ hasText: 'Open tutorial' }).click();
  await expect(page.locator('.tutorial')).toBeVisible();
  await page.locator('.tutorial .next').click();
  await expect(page.locator('.tutorial .index')).toContainText('2/');
  await expect(page.locator('.tutorial .sections >div:visible')).toHaveCount(1);
  await page.locator('.tutorial .previous').click();
  await expect(page.locator('.tutorial .index')).toContainText('1/');
  await page.locator('.tutorial .close').click();
  await page.locator('#menuopen').click();
  await page.locator('#menu li').filter({ hasText: 'Main menu' }).click();
  await expect(page.locator('.main-menu')).toBeVisible();
  await page.locator('#reeo-resume').click();
  await expect(page.locator('.main-menu')).toBeHidden();
  expect(await page.evaluate('components.length')).toBe(1);
});

test('two-finger pinch and trackpad gestures change the view without placing components', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await start(page);
  const session = await page.context().newCDPSession(page);
  const before = await page.evaluate('zoom');
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 400, y: 400, id: 1 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: 400, y: 400, id: 1 },
      { x: 600, y: 400, id: 2 },
    ],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: 300, y: 420, id: 1 },
      { x: 700, y: 420, id: 2 },
    ],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await page.evaluate('zoom')).toBeCloseTo(before * 2);
  expect(await page.evaluate('components.length')).toBe(0);
  const offsetBefore = await page.evaluate('offset.x');
  await page
    .locator('#canvas')
    .dispatchEvent('wheel', { deltaX: 25, deltaY: 15, clientX: 500, clientY: 400 });
  expect(await page.evaluate('offset.x')).not.toBe(offsetBefore);
  await page
    .locator('#canvas')
    .dispatchEvent('wheel', { deltaY: -20, ctrlKey: true, clientX: 500, clientY: 400 });
  expect(await page.evaluate('zoom')).toBeGreaterThan(before * 2);
});

test('touch double tap invokes double click, and hold opens a context menu', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1000 });
  await start(page);
  await page.evaluate(
    `window.touchDoubleClicks=0;canvas.addEventListener('dblclick',()=>window.touchDoubleClicks++)`,
  );
  const session = await page.context().newCDPSession(page);
  for (let i = 0; i < 2; i++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 450, y: 400, id: 1 }],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  expect(await page.evaluate('window.touchDoubleClicks')).toBe(1);
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 450, y: 400, id: 1 }],
  });
  await expect(page.locator('#contextMenu')).toBeVisible({ timeout: 2000 });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
});
