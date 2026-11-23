import { describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const collect = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? collect(path) : path.endsWith('.ts') ? [path] : [];
  });

describe('strict-CSP runtime safety', () => {
  test('component runtime never compiles expressions with eval', () => {
    for (const path of collect(new URL('../src/app', import.meta.url).pathname)) {
      const source = readFileSync(path, 'utf8');
      expect(source).not.toMatch(/\bnew\s+Function\b/);
      expect(source).not.toMatch(/\beval\s*\(/);
    }
  });
});
