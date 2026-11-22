import { describe, expect, test } from 'bun:test';
import { legacyMessages, translateLegacy } from './legacy-messages';
import { circuitPaths, circuitSVG, uiIcons } from './icons';
import { existsSync } from 'node:fs';

describe('complete legacy translation entries', () => {
  test('every source has distinct, nonempty Arabic and Egyptian entries', () => {
    const sources = new Set<string>();
    for (const [source, ar, arz] of legacyMessages) {
      expect(sources.has(source)).toBe(false);
      sources.add(source);
      for (const text of [ar, arz]) {
        expect(text.trim().length).toBeGreaterThan(0);
        expect(/[\u0600-\u06ff]/.test(text)).toBe(true);
      }
      expect(translateLegacy(source, 'en')).toBe(source);
      expect(translateLegacy(source, 'ar')).toBe(ar);
      expect(translateLegacy(source, 'arz')).toBe(arz);
    }
  });
  test('dynamic notices retain user values and translate surrounding text', () => {
    expect(translateLegacy('Saved changes to my-circuit.board', 'ar')).toBe(
      'حُفظت التغييرات في my-circuit.board',
    );
    expect(translateLegacy('Selected Input gate', 'arz')).toBe('اخترت مدخل');
    expect(translateLegacy('User-provided name', 'ar')).toBe('User-provided name');
  });
  test('every Phosphor icon has a bundled local SVG', () => {
    for (const name of Object.values(uiIcons))
      expect(existsSync(new URL(`../public/icons/phosphor/${name}.svg`, import.meta.url))).toBe(
        true,
      );
  });
  test('component symbols are vector paths, not symbolic text glyphs', () => {
    for (const component of [
      'NOT',
      'AND',
      'OR',
      'XOR',
      'Input',
      'Output',
      'Clock',
      'Delay',
      'ROM',
      'LED',
      'Display',
      'Custom',
    ]) {
      expect(circuitPaths[component]).toBeDefined();
      expect(circuitSVG(component)).toContain('<path');
      expect(circuitSVG(component)).not.toContain('<text');
    }
  });
});
