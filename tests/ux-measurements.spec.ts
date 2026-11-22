import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

type Measurement = {
  state: string;
  selector: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scrollWidth: number;
  clientWidth: number;
  occluded: boolean;
};
async function measure(page: Page, state: string, selector: string): Promise<Measurement[]> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  return page.locator(selector).evaluateAll(
    (elements, state) =>
      elements.flatMap((element) => {
        const e = element as HTMLElement;
        const r = e.getBoundingClientRect();
        if (!r.width || !r.height || getComputedStyle(e).display === 'none') return [];
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return [
          {
            state,
            selector: e.id ? `#${e.id}` : `${e.tagName}.${e.className}`,
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            scrollWidth: e.scrollWidth,
            clientWidth: e.clientWidth,
            occluded: !!hit && !e.contains(hit) && !hit.contains(e),
          },
        ];
      }),
    state,
  );
}

for (const [device, width, height] of [
  ['small-phone', 320, 568],
  ['phone', 390, 844],
  ['landscape', 844, 390],
  ['tablet', 800, 1280],
  ['laptop', 1366, 768],
  ['desktop', 1920, 1080],
] as const)
  for (const locale of ['en', 'ar', 'arz'] as const) {
    test(`${device} ${locale}: measured controls and overlay geometry`, async ({ page }, info) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
      await page.evaluate(`window.reeoI18n.setLocale('${locale}')`);
      const measurements: Measurement[] = [];
      async function surface(state: string, selector: string) {
        const values = await measure(page, state, selector);
        expect(values.length, `${state} exists`).toBeGreaterThan(0);
        for (const box of values) {
          expect(box.x, `${state} left`).toBeGreaterThanOrEqual(5);
          expect(box.y, `${state} top`).toBeGreaterThanOrEqual(-0.5);
          expect(box.x + box.width, `${state} right`).toBeLessThanOrEqual(width - 5);
          expect(box.y + box.height, `${state} bottom`).toBeLessThanOrEqual(height + 0.5);
          expect(box.scrollWidth, `${state} no horizontal scroll`).toBeLessThanOrEqual(
            box.clientWidth + 1,
          );
        }
        measurements.push(...values);
      }
      async function targets(state: string, selector: string) {
        const values = await measure(page, state, selector);
        for (const box of values) {
          expect(box.width, `${state} target width ${box.selector}`).toBeGreaterThanOrEqual(43.9);
          expect(box.height, `${state} target height ${box.selector}`).toBeGreaterThanOrEqual(43.9);
          expect(box.occluded, `${state} unobscured ${box.selector}`).toBe(false);
        }
        measurements.push(...values);
      }
      await targets('home', '.reeo-platform-bar button, .reeo-platform-bar select');
      await page.evaluate('newBoardMenu.show()');
      await surface('new-board', '.main-menu .new-board');
      await targets('new-board', '.new-board button');
      await page.evaluate(`newBoardMenu.hide();mainMenu.style.display='none';`);
      await targets('editor', '.reeo-touch-tools button, #toolbar > .slot, .brbtn');
      await page.evaluate('dialog.editComponent(new AND("Measurement",{x:0,y:0}))');
      await surface('edit-dialog', '#dialog');
      await targets('edit-dialog', '#dialog .close, #dialog .options button');
      await page.evaluate('dialog.hide();dialog.editRom(new AND("Memory",{x:0,y:0}))');
      await surface('rom-dialog', '#dialog');
      await targets('rom-dialog', '#dialog .options button');
      await page.evaluate('dialog.hide();dialog.settings()');
      await surface('settings-dialog', '#dialog');
      await page.evaluate('dialog.hide();list.show()');
      await surface('component-picker', '#list');
      await page.evaluate('list.hide();menu.show()');
      await surface('navigation', '#menu');
      await page.evaluate(
        `menu.hide();contextMenu.show((${width}-12)/zoom+offset.x,-(${height}-140)/zoom+offset.y)`,
      );
      await surface('context-menu', '#contextMenu');
      await page.evaluate(
        `contextMenu.hide();waypoints=[{x:0,y:0,label:'A'},{x:1,y:1,label:'B'}];waypointsMenu.show((${width}-12)/zoom+offset.x,-(${height}-140)/zoom+offset.y)`,
      );
      await surface('waypoints', '#waypointsMenu');
      await page.evaluate(
        `waypointsMenu.style.display='none';componentInfo.show(new AND('Details',{x:0,y:0}),{x:${width}-2,y:2})`,
      );
      await surface('component-info', '#componentInfo');
      await page.evaluate(`componentInfo.style.display='none';tutorial.show()`);
      // The original tutorial is an edge-docked panel (x=0), not a floating card.
      const tutorial = await measure(page, 'tutorial', '.tutorial');
      expect(tutorial[0]?.x).toBeGreaterThanOrEqual(0);
      expect((tutorial[0]?.y ?? 0) + (tutorial[0]?.height ?? 0)).toBeLessThanOrEqual(height + 1);
      measurements.push(...tutorial);
      await targets('tutorial', '.tutorial .close, .tutorial .previous, .tutorial .next');
      await page.evaluate('tutorial.hide();reeoConsole.show()');
      await surface('console', '.console');
      await targets('console', '.console .toolbar button');
      await info.attach('rendered-ux-measurements', {
        body: JSON.stringify({ device, width, height, locale, measurements }, null, 2),
        contentType: 'application/json',
      });
    });
  }
