import { describe, expect, it } from 'bun:test';
import { decodeBoard, validateCircuitData } from './board';
import { evaluateExpression } from './expression';
import { isLocale, messages, translator } from './i18n';
import { runTick } from './simulation';
import { popupPosition } from './geometry';
import { createStorage } from './storage';

function memory(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(key, value);
    },
  };
}
describe('typed local board storage', () => {
  it('round trips boards and reports UTF-8 byte sizes', () => {
    const fs = createStorage(memory());
    fs.writeFileSync('/reeo/../saves/hello.board', 'أهلًا');
    expect(fs.readFileSync('/saves/hello.board')).toBe('أهلًا');
    expect(fs.statSync('/saves/hello.board').size).toBe(new TextEncoder().encode('أهلًا').length);
    expect(fs.readdirSync('/saves/')).toEqual(['hello.board']);
  });
  it('has an empty initial component library', () =>
    expect(createStorage(memory()).readFileSync('/data/customcomponents.json')).toBe('[[],[]]'));
  it.each(['/etc/passwd', '/saves/../../secret.board', '/data/other.json'])(
    'rejects unsupported path %s',
    (path) => expect(() => createStorage(memory()).readFileSync(path)).toThrow(),
  );
  it('deletes only the chosen board', () => {
    const fs = createStorage(memory());
    fs.writeFileSync('/saves/a.board', 'a');
    fs.writeFileSync('/saves/b.board', 'b');
    fs.unlink('/saves/a.board', (error) => expect(error).toBeNull());
    expect(fs.readdirSync('/saves/')).toEqual(['b.board']);
  });
  it('returns quota errors instead of reporting success', () => {
    const store = memory();
    store.setItem = () => {
      throw new Error('quota');
    };
    const fs = createStorage(store);
    fs.writeFile('/saves/a.board', '{}', 'utf8', (error) => expect(error?.message).toBe('quota'));
  });
});
describe('safe numeric expressions', () => {
  it.each<[string, number]>([
    ['2 + 3 * 4', 14],
    ['(2 + 3) * 4', 20],
    ['10 / 2 - 1', 4],
    ['-2 + 5', 3],
    ['.5 * 4', 2],
    ['10 % 3', 1],
    ['0', 0],
  ])('evaluates %s', (expression, result) => expect(evaluateExpression(expression)).toBe(result));
  it('supports component properties referencing variables including zero', () =>
    expect(evaluateExpression('2 * delay - zero', { delay: 100, zero: 0 })).toBe(200));
  it.each([
    'alert(1)',
    'window.location',
    'process.exit()',
    'constructor',
    '1/0',
    'foo',
    '1;2',
    '2**3',
    '(2+3',
    '',
    '1e999',
  ])('rejects %s', (expression) => expect(() => evaluateExpression(expression)).toThrow());
});
describe('typed update scheduler used by the original simulator', () => {
  it('processes tasks in order, including tasks queued during propagation', () => {
    const order: number[] = [];
    const queue = [
      () => {
        order.push(1);
        queue.push(() => {
          order.push(3);
        });
      },
      () => {
        order.push(2);
      },
    ];
    expect(runTick(queue, false)).toEqual({ updates: 3, pending: 0, saturated: false });
    expect(order).toEqual([1, 2, 3]);
  });
  it('preserves pending work while paused', () => {
    const queue = [() => undefined];
    expect(runTick(queue, true).updates).toBe(0);
    expect(queue).toHaveLength(1);
  });
  it('bounds feedback loops', () => {
    const task = () => {
      queue.push(task);
    };
    const queue = [task];
    expect(runTick(queue, false, 25)).toEqual({ updates: 25, pending: 1, saturated: true });
  });
  it('rejects invalid budgets', () => expect(() => runTick([], false, 0)).toThrow());
});
describe('board compatibility boundary', () => {
  const empty = {
    name: 'My circuit',
    offset: { x: 0, y: 0 },
    zoom: 100,
    variables: {},
    variableReferences: {},
    data: '[[],[]]',
  };
  it('accepts original save format', () =>
    expect(decodeBoard(JSON.stringify(empty))).toEqual(empty));
  it('accepts original raw circuit arrays', () => expect(decodeBoard('[[],[]]')).toEqual([[], []]));
  it.each(['{}', 'invalid json', '[null,[]]', '{"__proto__":{}}'])(
    'rejects malformed board %s',
    (text) => expect(() => decodeBoard(text)).toThrow(),
  );
  it('rejects unknown component constructors', () =>
    expect(() => validateCircuitData([[['eval', {}]], []])).toThrow());
  it('caps import size', () => expect(() => decodeBoard(' '.repeat(2_000_001))).toThrow());
});
describe('complete typed core-language dictionaries', () => {
  it.each(['ar', 'arz'] as const)('%s covers all core messages', (locale) => {
    expect(Object.keys(messages[locale]).sort()).toEqual(Object.keys(messages.en).sort());
    expect(Object.values(messages[locale]).every((text) => text.trim().length > 0)).toBe(true);
  });
  it('has distinct Egyptian Arabic copy', () =>
    expect(translator('arz')('welcome')).not.toBe(translator('ar')('welcome')));
  it('only accepts supported locales', () => {
    expect(isLocale('arz')).toBe(true);
    expect(isLocale('unknown')).toBe(false);
  });
});

describe('popup geometry', () => {
  it.each([
    [10, 10],
    [380, 10],
    [10, 830],
    [380, 830],
    [200, 420],
    [-20, -20],
    [900, 1500],
  ])('keeps the popup in bounds at %s, %s', (x, y) => {
    const rect = popupPosition(x, y, 220, 160, 390, 844);
    expect(rect.left).toBeGreaterThanOrEqual(8);
    expect(rect.top).toBeGreaterThanOrEqual(8);
    expect(rect.left + 220).toBeLessThanOrEqual(382);
    expect(rect.top + 160).toBeLessThanOrEqual(836);
  });
  it('anchors normally rather than jumping to the page origin', () =>
    expect(popupPosition(400, 300, 220, 160, 1366, 768)).toEqual({ left: 400, top: 300 }));
  it('flips above and left at a bottom-right edge', () =>
    expect(popupPosition(380, 830, 220, 160, 390, 844)).toEqual({ left: 160, top: 670 }));
});
