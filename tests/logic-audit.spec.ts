import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
});

test('primitive gates exhaust all binary truth table rows', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    const results = [];
    for (const Gate of [AND, OR, XOR]) {
      for (let a=0;a<2;a++) for (let b=0;b<2;b++) {
        const gate = new Gate('gate',{x:0,y:0});
        gate.input[0].value=a; gate.input[1].value=b; gate.function();
        results.push(gate.output[0].value);
      }
    }
    const gate = new NOT('not',{x:0,y:0});
    for (let a=0;a<2;a++) { gate.input[0].value=a; gate.function(); results.push(gate.output[0].value); }
    return results;
  })()`),
  ).toEqual([0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0]);
});

test('sources, momentary button and sinks preserve their signals', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    const pos={x:0,y:0}; const result=[];
    for (const value of [0,1]) { const c=new Constant('c',pos,value); c.function(); result.push(c.output[0].value); }
    const input=new Input('i',pos); input.onmousedown(false); result.push(input.output[0].value); input.onmousedown(false); result.push(input.output[0].value);
    const button=new Button('b',pos); button.onmousedown(false); result.push(button.output[0].value); button.onmouseup(false); result.push(button.output[0].value);
    for (const Sink of [Output,Debug]) { const sink=new Sink('sink',pos); sink.input[0].value=1; sink.function(); result.push(sink.value,sink.input[0].value); }
    return result;
  })()`),
  ).toEqual([0, 1, 1, 0, 1, 0, 1, 1, 1, 1]);
});

test('counter counts rising edges, not refreshes while high', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    const c=new Counter('count',{x:0,y:0}); const result=[];
    for (const bit of [0,1,1,1,0,0,1,1,0]) { c.input[0].value=bit; c.function(); result.push(c.value); }
    return result;
  })()`),
  ).toEqual([0, 1, 1, 1, 1, 1, 2, 2, 2]);
});

test('ROM reads bit 31 as an unsigned data bit', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    const rom=new ROM('memory',{x:0,y:0});
    rom.properties={addressWidth:1,dataWidth:32,data:'80000000FFFFFFFF',rom:[0x80000000,0xffffffff]};
    rom.addInputPort({side:3,pos:0});
    for(let i=0;i<32;i++) rom.addOutputPort({side:1,pos:i});
    rom.function(); const first=rom.output.map(p=>p.value);
    rom.input[0].value=1; rom.function();
    return [first,rom.output.map(p=>p.value)];
  })()`),
  ).toEqual([Array.from({ length: 32 }, (_, i) => Number(i === 31)), Array(32).fill(1)]);
});

test('wire fan-out propagates both levels and pause defers queued work', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    updateQueue=[];
    const source=new Input('in',{x:0,y:0}); const a=new LED('a',{x:4,y:0}); const b=new Output('b',{x:4,y:2});
    const trunk=new Wire([{x:2,y:0},{x:3,y:0}]); const branch=new Wire([{x:3,y:0},{x:4,y:2}]);
    connect(source.output[0],a.input[0],trunk); connect(null,b.input[0],branch); connectWires(trunk,branch);
    const result=[];
    source.onmousedown(false); pauseSimulation=true; tick(); result.push(a.value,b.value,updateQueue.length>0);
    pauseSimulation=false; tick(); result.push(a.value,b.value);
    source.onmousedown(false); tick(); result.push(a.value,b.value);
    return result;
  })()`),
  ).toEqual([0, 0, true, 1, 1, 0, 0]);
});

test('ROM ports and zero constants survive save/load and cloning', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    const rom=new ROM('rom',{x:0,y:0});
    rom.properties={addressWidth:1,dataWidth:4,data:'A5',rom:[10,5]};
    rom.addInputPort({side:3,pos:0},'address');
    for(let i=0;i<4;i++) rom.addOutputPort({side:1,pos:i},'bit'+i);
    const zero=new Constant('zero',{x:5,y:0},0);
    const loaded=parse(stringify([rom,zero])).components;
    loaded[0].input[0].value=1; loaded[0].function(); loaded[1].function();
    const copy=cloneComponent(loaded[0]); copy.input[0].value=0; copy.function();
    return [loaded[0].input.length,loaded[0].output.map(p=>p.value),loaded[1].output[0].value,copy.output.map(p=>p.value)];
  })()`),
  ).toEqual([1, [1, 0, 1, 0], 0, [0, 1, 0, 1]]);
});

test('custom inverter works before and after portable serialization', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    updateQueue=[];
    const i=new Input('in',{x:0,y:0}), n=new NOT('not',{x:3,y:0}), o=new Output('out',{x:6,y:0});
    const a=new Wire([{x:2,y:0},{x:3,y:0}]), b=new Wire([{x:4,y:0},{x:6,y:0}]);
    connect(i.output[0],n.input[0],a); connect(n.output[0],o.input[0],b);
    const c=new Custom('inverter',{x:0,y:0},[i,n,o],[a,b]);
    const result=[];
    for(const circuit of [c,parse(stringify([c])).components[0]]) {
      for(const bit of [0,1,0]) { circuit.input[0].value=bit; circuit.update(); tick(); result.push(circuit.output[0].value); }
    }
    return result;
  })()`),
  ).toEqual([1, 0, 1, 1, 0, 1]);
});

test('deleting a clock stops its scheduled activity', async ({ page }) => {
  expect(
    await page.evaluate(`(async () => {
    const clock=new Clock('clock',{x:0,y:0}); clock.properties.delay=20; components.push(clock);
    await new Promise(resolve=>setTimeout(resolve,140));
    removeComponent(clock); const before=clock.value;
    await new Promise(resolve=>setTimeout(resolve,35));
    return clock.value===before;
  })()`),
  ).toBe(true);
});

test('delay delivers transitions in order and deletion cancels pending output', async ({
  page,
}) => {
  expect(
    await page.evaluate(`(async () => {
    const d=new Delay('delay',{x:0,y:0}); d.properties.delay=25; components.push(d);
    const result=[]; d.input[0].value=1; d.update(); result.push(d.output[0].value);
    await new Promise(resolve=>setTimeout(resolve,50)); tick(); result.push(d.output[0].value);
    d.input[0].value=0; d.update();
    await new Promise(resolve=>setTimeout(resolve,50)); tick(); result.push(d.output[0].value);
    d.input[0].value=1; d.update(); removeComponent(d);
    await new Promise(resolve=>setTimeout(resolve,50)); tick(); result.push(d.output[0].value);
    return result;
  })()`),
  ).toEqual([0, 1, 0, 0]);
});

test('wire removal and undo restore signal propagation', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    updateQueue=[]; undoStack=[]; redoStack=[];
    const a=new Input('in',{x:0,y:0}), b=new Output('out',{x:5,y:0}); components.push(a,b);
    const w=new Wire([{x:2,y:0},{x:5,y:0}]); wires.push(w); connect(a.output[0],b.input[0],w);
    a.onmousedown(false); tick(); const result=[b.value];
    removeWire(w,true); tick(); result.push(b.value);
    undo(); tick(); result.push(b.value);
    redo(); tick(); result.push(b.value);
    return result;
  })()`),
  ).toEqual([1, 0, 1, 0]);
});

test('editing component position updates both coordinates', async ({ page }) => {
  await page.locator('.main-menu > button').first().click();
  await page.getByPlaceholder('Board name').fill('Logic audit');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('#dialog')).toBeVisible();
  await page.locator('#dialog .close').click();
  await page.evaluate(
    `window.auditComponent=new Input('position',{x:0,y:0}); dialog.editComponent(window.auditComponent)`,
  );
  await page.locator('#dialog input').nth(1).fill('7,-4');
  await page.locator('#dialog button').filter({ hasText: /^OK$/ }).click();
  expect(await page.evaluate('window.auditComponent.pos')).toEqual({ x: 7, y: -4 });
});

test('connecting a low wire clears stale high destination state', async ({ page }) => {
  expect(
    await page.evaluate(`(() => {
    updateQueue=[];
    const i=new Input('low',{x:0,y:0}), o=new Output('stale',{x:4,y:0});
    o.input[0].value=1; o.value=1;
    connect(i.output[0],o.input[0],new Wire([{x:2,y:0},{x:4,y:0}])); tick(); return o.value;
  })()`),
  ).toBe(0);
});

test('audio gracefully handles missing support and resumes suspended contexts', async ({
  page,
}) => {
  expect(
    await page.evaluate(`(async () => {
    const Native=window.AudioContext, Webkit=window.webkitAudioContext;
    const calls=[];
    try {
      audioCtx=undefined; window.AudioContext=undefined; window.webkitAudioContext=undefined;
      const unsupported=await beep();
      window.AudioContext=class {
        state='suspended'; sampleRate=48000; currentTime=10; destination={};
        async resume(){calls.push('resume');this.state='running';}
        createOscillator(){return {frequency:{value:0},connect(){calls.push('connect')},start(){calls.push('start')},stop(time){calls.push(time)},disconnect(){}};}
      };
      const supported=await beep(440,250);
      const invalid=await beep(-1,250);
      return [unsupported,supported,invalid,calls];
    } finally { audioCtx=undefined; window.AudioContext=Native; window.webkitAudioContext=Webkit; }
  })()`),
  ).toEqual([false, true, false, ['resume', 'connect', 'start', 10.25]]);
});

test('clock deletion undo restarts ticking and clear board cancels timers', async ({ page }) => {
  expect(
    await page.evaluate(`(async () => {
    const clock=new Clock('clock',{x:0,y:0}); clock.properties.delay=15; components.push(clock);
    let count=0; const original=clock.tick; clock.tick=function(){count++;return original.call(this)};
    await new Promise(resolve=>setTimeout(resolve,140));
    removeComponent(clock,true); const removed=count;
    await new Promise(resolve=>setTimeout(resolve,50)); const stopped=count===removed;
    undo(); await new Promise(resolve=>setTimeout(resolve,50)); const restarted=count>removed;
    clearBoard(); const cleared=count;
    await new Promise(resolve=>setTimeout(resolve,50));
    return [stopped,restarted,count===cleared,updateQueue.length];
  })()`),
  ).toEqual([true, true, true, 0]);
});

test('console edit coerces numbers and supports dotted expression paths', async ({ page }) => {
  const result = await page.evaluate(`(() => {
    const clock = new Clock('editable clock', { x: 0, y: 0 });
    clock.properties.delay = 500;
    components.push(clock);
    const before = clock.properties.delay;
    inputHandler('edit ' + clock.id + ' properties.delay 2 * 125');
    return { before, after: clock.properties.delay };
  })()`);
  expect(result.after).toBe(250);
  expect(result.after).not.toBe(result.before);
});

test('clear local data removes REEO keys but preserves unrelated storage', async ({ page }) => {
  await page.evaluate(`(() => {
    localStorage.setItem('reeo.files.v1:saves/clear-test.board', '{"name":"clear test"}');
    localStorage.setItem('reeo.locale', 'ar');
    localStorage.setItem('pwsData', '{"sentinel":true}');
    localStorage.setItem('unrelated-app-key', 'keep');
    dialog.settings();
  })()`);
  await page.locator('#dialog #reset').click();
  const reloaded = page.waitForEvent('load');
  await page.locator('#dialog .options button', { hasText: 'OK' }).click();
  await reloaded;
  await expect(page.locator('body')).toHaveAttribute('data-reeo-ready', 'true');
  const keys = await page.evaluate(`({
    board: localStorage.getItem('reeo.files.v1:saves/clear-test.board'),
    locale: localStorage.getItem('reeo.locale'),
    legacy: localStorage.getItem('pwsData'),
    unrelated: localStorage.getItem('unrelated-app-key')
  })`);
  expect(keys.board).toBeNull();
  expect(keys.locale).toBeNull();
  expect(keys.unrelated).toBe('keep');
  expect(keys.legacy ? JSON.parse(keys.legacy).sentinel : undefined).toBeUndefined();
});
