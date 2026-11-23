import { expect, test } from '@playwright/test';

test.use({ hasTouch: false });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(`document.querySelector('.main-menu').style.display='none'`);
});

test('board code builds a wired circuit and reports syntax errors', async ({ page }) => {
  await page.waitForFunction(() => typeof window.reeoOpenProgram === 'function');
  await page.evaluate('window.reeoOpenProgram()');
  const overlay = page.locator('.reeo-program-overlay');
  await expect(overlay).toBeVisible();
  await overlay.locator('textarea').fill(`
    input A
    input B
    and G A B
    not N G
    led L N
  `);
  await overlay.locator('.reeo-program-build').click();
  await expect(overlay).toBeHidden();
  const built = await page.evaluate(`({
    names: components.map(c=>c.name),
    wires: wires.length,
    connected: components.find(c=>c.name==='G').input.filter(p=>p.connection).length
  })`);
  expect(built).toEqual({ names: ['A', 'B', 'G', 'N', 'L'], wires: 4, connected: 2 });

  await page.evaluate('window.reeoOpenProgram()');
  await page.locator('.reeo-program-overlay textarea').fill('input A\nand G A MISSING');
  await page.locator('.reeo-program-build').click();
  await expect(page.locator('.reeo-program-errors')).toContainText('Unknown source "MISSING"');
  await expect(page.locator('.reeo-program-overlay')).toBeVisible();
});

test('new sound, switch, display and procedural parts are pickable', async ({ page }) => {
  const labels = (await page.locator('#list li').allTextContents()).map((label) => label.trim());
  for (const label of [
    'Buzzer',
    'Tone',
    'Dip Switch',
    'Slider',
    'RGB LED',
    'RGB LED 2-bit',
    'Bar Graph',
    'Seven Segment',
    'Lamp',
    'Motor',
    'Splitter',
    'Merger',
    'Procedural',
  ]) {
    expect(labels).toContain(label);
  }

  const result = await page.evaluate(`(() => {
    const names=['Buzzer','Tone','DipSwitch','Slider','RGBLed','BarGraph','SevenSegment','Lamp','Motor','Splitter','Merger','Procedural'];
    const parts=names.map((name,index)=>new constructors[name](name,{x:index*4,y:0}));
    parts.forEach(part=>part.update());
    const rgb=parts.find(part=>part.name==='RGBLed');
    rgb.input[0].value=rgb.input[1].value=1; rgb.update();
    const procedural=parts.find(part=>part.name==='Procedural');
    procedural.input[0].value=1; procedural.input[1].value=1; procedural.update();
    return {
      ports: parts.map(part=>[part.name,part.input.length,part.output.length]),
      rgb: rgb.value,
      procedural: procedural.output[0].value
    };
  })()`);
  expect(result.rgb).toBe(6);
  expect(result.procedural).toBe(0);
  expect(result.ports).toContainEqual(['Tone', 4, 0]);
  expect(result.ports).toContainEqual(['SevenSegment', 8, 0]);
  expect(result.ports).toContainEqual(['Splitter', 1, 4]);
  expect(result.ports).toContainEqual(['Slider', 0, 4]);
});

test('bulk auto-wire and auto-route make orthogonal connections', async ({ page }) => {
  const result = await page.evaluate(`(() => {
    const a=new Input('A',{x:0,y:0});
    const g=new AND('G',{x:4,y:0});
    const l=new LED('L',{x:10,y:-2});
    components=[a,g,l]; wires=[]; const selection={components:[a,g,l],wires:[]};
    autoWireSelection(selection);
    const wired=wires.length;
    selection.wires=[...wires];
    autoRouteSelection(selection);
    return {
      wired,
      paths:wires.map(wire=>wire.pos.length),
      connected:[a.output[0].connection!==null,g.input[0].connection!==null,g.output[0].connection!==null,l.input[0].connection!==null]
    };
  })()`);
  expect(result.wired).toBe(2);
  expect(result.connected.every(Boolean)).toBe(true);
  expect(result.paths.every((length: number) => length >= 2)).toBe(true);
});

test('guide ghost is click-through until hovered and never spawns at the origin', async ({
  page,
}) => {
  await page.evaluate('window.reeoHelp.open()');
  await page.getByRole('button', { name: 'Worked circuits', exact: true }).first().click();
  await page.getByRole('button', { name: 'Follow these steps while building' }).first().click();
  const dock = page.locator('#reeo-guide-dock');
  await expect(dock).toBeVisible();
  await page.mouse.move(1180, 700);
  await expect(dock).toHaveCSS('pointer-events', 'none');
  expect(await dock.evaluate((node) => Number(getComputedStyle(node).opacity))).toBeLessThan(0.6);
  const state = await page.evaluate('window.reeoGhostState()');
  expect(state.origin.x === 0 && state.origin.y === 0).toBe(false);
  const box = await dock.boundingBox();
  if (!box) throw new Error('guide dock has no box');
  await page.mouse.move(box.x + 40, box.y + 40);
  await expect(dock).toHaveCSS('pointer-events', 'auto');
  await page.waitForTimeout(250);
  expect(await dock.evaluate((node) => Number(getComputedStyle(node).opacity))).toBe(1);
  await expect(dock.getByRole('button', { name: 'Hide ghost' })).toBeVisible();
});

test('displays stack into one module and take their colour from signals', async ({ page }) => {
  const result = await page.evaluate(`(() => {
    const display = new Display('D', {x: 0, y: 0});
    display.addDigit();
    [0,1,0,1,1,0,0,1].forEach((value, index) => display.input[index].value = value);
    display.update();
    const digits = [...display.digitValues];
    display.properties.colorMode = 'signal';
    display.configureDisplay();
    display.input[8].value = 1;
    const colourPort = display.input[8];
    display.addDigit();
    const colourKept = display.input.includes(colourPort) && display.input.indexOf(colourPort) === 12;
    display.removeDigit();
    return {
      colourKept,
      width: display.width,
      height: display.height,
      digits: display.properties.digits,
      ports: display.input.length,
      dataSides: display.input.slice(0, 8).map(port => port.pos.side),
      colourSides: display.input.slice(8).map(port => port.pos.side),
      colour: displayOnColor(display),
      values: digits,
      seven: (() => {
        const part = new SevenSegment('S', {x: 0, y: 0});
        part.properties.colorMode = 'signal';
        part.configureSegments();
        return {ports: part.input.length, colourSides: part.input.slice(8).map(port => port.pos.side)};
      })(),
      rgb: (() => {
        const part = new RGBLed('L', {x: 0, y: 0});
        return {pins: part.input.map(port => port.pos.pos), shape: part.properties.shape};
      })(),
      rgb2: (() => {
        const part = new RGBLed2('R', {x: 0, y: 0});
        part.input[0].value = 1;
        part.input[1].value = 1;
        part.update();
        return {
          ports: part.input.length,
          value: part.value,
          pins: part.input.map(port => port.pos.pos)
        };
      })()
    };
  })()`);
  expect(result).toMatchObject({
    colourKept: true,
    width: 6,
    height: 4,
    digits: 2,
    ports: 11,
    colour: 'rgb(255,176,32)',
    values: [10, 9],
    seven: { ports: 11, colourSides: [3, 3, 3] },
    rgb: { pins: [-0.25, 0, 0.25], shape: 'panel' },
    rgb2: { ports: 2, value: 3, pins: [-0.2, 0.2] },
  });
  expect(result.dataSides.every((side: number) => side === 0)).toBe(true);
  expect(result.colourSides).toEqual([3, 3, 3]);
});

test('displays start unpowered and light only after wiring', async ({ page }) => {
  const result = await page.evaluate(`(() => {
    const display = new Display('D', {x: 0, y: 0});
    const blank = display.isPowered();
    display.input[0].connection = {};
    const wired = display.isPowered();
    const seven = new SevenSegment('S', {x: 0, y: 0});
    return { blank, wired, sevenBlank: seven.segments === undefined };
  })()`);
  expect(result).toEqual({ blank: false, wired: true, sevenBlank: true });
});

test('old RGB LED boards load with pins spread over the body', async ({ page }) => {
  const result = await page.evaluate(`(() => {
    const board = (type, positions) => [[[type, {
      name: 'old', pos: {x: 0, y: 0}, width: 1, height: 1,
      properties: type === 'RGBLed' ? {shape: 'panel', styleVersion: 2} : {},
      input: positions.map((pos, index) => ({
        name: type === 'RGBLed' ? ['R','G','B'][index] : 'B' + index,
        value: 0,
        pos: {side: 3, pos}
      })),
      output: []
    }]], []];
    return ['RGBLed', 'RGBLed2'].map(type => {
      const part = parse(board(type, type === 'RGBLed' ? [0.2,0.5,0.8] : [0.3,0.7])).components[0];
      return {shape: part.properties.shape, pins: part.input.map(port => port.pos.pos)};
    });
  })()`);
  expect(result).toEqual([
    { shape: 'panel', pins: [-0.25, 0, 0.25] },
    { shape: undefined, pins: [-0.2, 0.2] },
  ]);
});

test('procedural expressions compile without eval and report bad input', async ({ page }) => {
  const result = await page.evaluate(`(() => {
    const good = new Procedural('P', {x: 0, y: 0});
    good.properties.expression = 'A && !B';
    good.compile();
    good.input[0].value = 1;
    good.input[1].value = 0;
    good.update();
    const bad = new Procedural('Q', {x: 0, y: 0});
    bad.properties.expression = 'alert(1)';
    bad.compile();
    return {value: good.output[0].value, error: good.compileError, bad: bad.compileError};
  })()`);
  expect(result).toEqual({ value: 1, error: false, bad: true });
});
