import { test, expect } from '@playwright/test';
async function start(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  await page.evaluate(`mainMenu.style.display='none'`);
  await expect(page.locator('.reeo-touch-tools')).toBeVisible();
}
test('full guide searches all components and pins a recipe without modifying the board', async ({
  page,
}) => {
  await start(page);
  await page.locator('#reeo-help').click();
  const help = page.locator('#reeo-help-panel');
  await expect(help).toBeVisible();
  await help.getByRole('button', { name: 'Every component', exact: true }).click();
  await expect(help.locator('article')).toHaveCount(19);
  await help.getByRole('searchbox').fill('Counter');
  await expect(help.locator('article')).toHaveCount(1);
  await expect(help).toContainText('no binary output bus');
  await help.getByRole('button', { name: 'Worked circuits', exact: true }).click();
  await expect(help.locator('article')).toHaveCount(8);
  await help.getByRole('searchbox').fill('half adder');
  await help
    .locator('article')
    .first()
    .getByRole('button', { name: 'Follow these steps while building' })
    .click();
  await expect(help).toBeHidden();
  await expect(page.locator('#reeo-guide-dock')).toBeVisible();
  await expect(page.locator('#reeo-guide-dock')).toContainText('1/3');
  await page.locator('#reeo-guide-dock').getByRole('button', { name: 'Next step' }).click();
  await expect(page.locator('#reeo-guide-dock')).toContainText('2/3');
  expect(await page.evaluate('components.length')).toBe(0);
  const ghostView = await page.locator('#canvas').screenshot();
  await page.getByRole('button', { name: 'Hide ghost', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show ghost', exact: true })).toBeVisible();
  const cleanView = await page.locator('#canvas').screenshot();
  expect(ghostView.equals(cleanView)).toBe(false);
  await page.getByRole('button', { name: 'Show ghost', exact: true }).click();
  await page.getByRole('button', { name: 'Fit guide', exact: true }).click();
  expect(await page.evaluate('components.length')).toBe(0);
});
test('diagnostics explain a real unwired gate and locate it without changing wiring', async ({
  page,
}) => {
  await start(page);
  await page.evaluate(
    `mainMenu.style.display='none';components=[new AND('Safety check',{x:3,y:-3})];window.reeoHelp.open('check')`,
  );
  await expect(page.locator('#reeo-help-results')).toContainText('not connected');
  await expect(page.locator('#reeo-help-results')).toContainText('may be intentional');
  await page.getByRole('button', { name: 'Locate on grid' }).click();
  await expect(page.locator('#reeo-help-panel')).toBeHidden();
  expect(await page.evaluate('components[0].outline')).toBe(1);
  expect(await page.evaluate('components[0].input.filter(p=>p.connection).length')).toBe(0);
});
test('automatic contextual advice waits for stable wiring and can be disabled', async ({
  page,
}) => {
  await start(page);
  await page.clock.install();
  await page.evaluate(
    `mainMenu.style.display='none';const a=new Input('a',{x:0,y:0}),g=new AND('gate',{x:4,y:0});components=[a,g];const w=new Wire([{x:2,y:0},{x:4,y:0}]);wires=[w];connect(a.output[0],g.input[0],w);`,
  );
  await page.clock.fastForward(6000);
  await expect(page.locator('.reeo-smart-tip')).toBeVisible();
  await page
    .locator('.reeo-smart-tip')
    .getByRole('button', { name: 'Review', exact: true })
    .click();
  await expect(page.locator('#reeo-help-panel')).toBeVisible();
  await page.locator('#reeo-help-panel input[type=checkbox]').uncheck();
  expect(await page.evaluate(`localStorage.getItem('reeo.contextualTips')`)).toBe('off');
});
for (const locale of ['ar', 'arz'])
  test(`${locale}: searchable guide is localized and fits a small viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await start(page);
    await page.evaluate(`window.reeoI18n.setLocale('${locale}');window.reeoHelp.open('ROM')`);
    const help = page.locator('#reeo-help-panel');
    await expect(help.locator('article')).toHaveCount(1);
    expect(await help.locator('article').textContent()).toMatch(/[\u0600-\u06ff]/);
    const r = await help.boundingBox();
    expect(r).not.toBeNull();
    if (r) {
      expect(r.x).toBeGreaterThanOrEqual(11);
      expect(r.y + r.height).toBeLessThanOrEqual(557);
      expect(r.x + r.width).toBeLessThanOrEqual(309);
    }
    expect(await help.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(help).toBeHidden();
  });
test('grid rendering calls body renderer and preserves wiring/simulation', async ({ page }) => {
  await start(page);
  const result = await page.evaluate(
    `(() => {let calls=[];const original=window.reeoDrawComponentBody;window.reeoDrawComponentBody=(ctx,part,...args)=>{calls.push(part.constructor.name);return original(ctx,part,...args)};zoom=zoomAnimation=60;offset={x:0,y:0};const a=new Input('a',{x:2,y:-4}),g=new NOT('not',{x:5,y:-4}),o=new Output('out',{x:8,y:-4});components=[a,g,o];const w=new Wire([{x:4,y:-4},{x:5,y:-4}]),v=new Wire([{x:6,y:-4},{x:8,y:-4}]);connect(a.output[0],g.input[0],w);connect(g.output[0],o.input[0],v);tick();components.forEach(p=>p.draw());const low=o.value;a.onmousedown(false);tick();window.reeoDrawComponentBody=original;return {calls,values:[low,o.value]}})()`,
  );
  expect(result.calls).toEqual(['Input', 'NOT', 'Output']);
  expect(result.values).toEqual([1, 0]);
});

test('learning UI reuses the existing dialog theme instead of a separate palette', async ({
  page,
}) => {
  await start(page);
  const dialogTheme = await page.evaluate(`(() => {
    dialog.editComponent(new AND('Theme reference',{x:0,y:0}));
    const surface=getComputedStyle(document.getElementById('dialog'));
    const button=getComputedStyle(document.querySelector('#dialog .options button'));
    const reference={surface:surface.backgroundColor,text:surface.color,radius:surface.borderRadius,font:surface.fontFamily,button:button.backgroundColor,buttonText:button.color,buttonBorder:button.borderStyle,buttonShadow:button.boxShadow};
    dialog.hide();return reference;
  })()`);
  await page.evaluate(`window.reeoHelp.open('AND')`);
  const guideTheme = await page.locator('#reeo-help-panel').evaluate((el) => {
    const surface = getComputedStyle(el);
    const control = el.querySelector('header button');
    if (!control) throw new Error('Guide close control missing');
    const button = getComputedStyle(control);
    return {
      surface: surface.backgroundColor,
      text: surface.color,
      radius: surface.borderRadius,
      font: surface.fontFamily,
      button: button.backgroundColor,
      buttonText: button.color,
      buttonBorder: button.borderStyle,
      buttonShadow: button.boxShadow,
    };
  });
  expect(guideTheme).toEqual(dialogTheme);
  const article = await page.locator('.reeo-help-card').evaluate((el) => {
    const style = getComputedStyle(el);
    return { background: style.backgroundColor, radius: style.borderRadius };
  });
  expect(article).toEqual({ background: 'rgba(0, 0, 0, 0)', radius: '0px' });
});

for (const [width, height] of [
  [944, 590],
  [320, 568],
  [844, 390],
  [1366, 768],
]) {
  test(`pinned steps and picker do not overlap at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await start(page);
    await page.evaluate(`mainMenu.style.display='none';window.reeoHelp.open()`);
    const help = page.locator('#reeo-help-panel');
    await help.locator('nav').getByRole('button', { name: 'Worked circuits', exact: true }).click();
    await help
      .locator('article')
      .first()
      .getByRole('button', { name: 'Follow these steps while building' })
      .click();
    await page.locator('#toolbar > .slot').first().click();
    await expect(page.locator('#list')).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const guideElement = document.getElementById('reeo-guide-dock');
          const pickerElement = document.getElementById('list');
          const toolbarElement = document.getElementById('toolbar');
          if (!guideElement || !pickerElement || !toolbarElement)
            throw new Error('Editor surfaces missing');
          const guide = guideElement.getBoundingClientRect();
          const picker = pickerElement.getBoundingClientRect();
          const toolbar = toolbarElement.getBoundingClientRect();
          return {
            overlap:
              guide.left < picker.right &&
              guide.right > picker.left &&
              guide.top < picker.bottom &&
              guide.bottom > picker.top,
            inside:
              guide.left >= 8 &&
              picker.left >= 8 &&
              guide.right <= innerWidth - 8 &&
              picker.right <= innerWidth - 8 &&
              guide.top >= 8 &&
              picker.top >= 8,
            aboveTools: Math.max(guide.bottom, picker.bottom) <= toolbar.top - 8,
            bottomLeft:
              Math.abs(guide.left - 12) < 1 &&
              Math.abs(
                guide.bottom -
                  (Math.min(
                    toolbar.top,
                    document.querySelector('.brbtns')?.getBoundingClientRect().top ?? toolbar.top,
                  ) -
                    12),
              ) < 1,
          };
        }),
      )
      .toEqual({ overlap: false, inside: true, aboveTools: true, bottomLeft: true });
    await page.getByRole('button', { name: 'Back to editor', exact: true }).click();
    await expect(page.locator('#reeo-guide-dock')).toBeHidden();
    // Closing the checklist restores the normal picker anchor above its toolbar.
    await expect
      .poll(async () => page.locator('#list').evaluate((el) => el.style.maxHeight))
      .toBe('');
  });
}
