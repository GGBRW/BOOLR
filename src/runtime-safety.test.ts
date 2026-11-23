import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

describe('strict-CSP runtime safety', () => {
  test('component runtime never compiles expressions with eval', () => {
    const source = readFileSync(new URL('../app/js/components.js', import.meta.url), 'utf8');
    expect(source).not.toMatch(/\bnew\s+Function\b/);
    expect(source).not.toMatch(/\beval\s*\(/);
  });
});
