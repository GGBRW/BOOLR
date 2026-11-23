import { describe, expect, test } from 'bun:test';
import { highlightProgram } from './program-highlight';

describe('board code highlighting', () => {
  test('marks commands, names and references without executing input', () => {
    const html = highlightProgram('input A at 0,0\nand G A B // gate');
    expect(html).toContain('tok-type');
    expect(html).toContain('tok-name');
    expect(html).toContain('tok-reference');
    expect(html).toContain('tok-comment');
    expect(html).toContain('data-line="1"');
  });

  test('escapes markup and flags error lines', () => {
    const html = highlightProgram('<img src=x onerror=alert(1)>', new Set([1]));
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;');
    expect(html).toContain('is-error');
  });
});
