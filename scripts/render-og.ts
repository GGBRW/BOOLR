#!/usr/bin/env bun
/**
 * Rasterise public/brand/og-source.svg at 1200 × 630 with the real brand fonts.
 * resvg loads the font files directly; @font-face URLs alone are intentionally
 * not trusted here because headless renderers silently fall back.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync(new URL('../public/brand/og-source.svg', import.meta.url), 'utf8');
const fontFiles = [
  fileURLToPath(new URL('../public/brand/REEOCircuitDisplay.ttf', import.meta.url)),
  fileURLToPath(new URL('../public/fonts/alan-sans/AlanSans-Variable.ttf', import.meta.url)),
];
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: {
    fontFiles,
    loadSystemFonts: false,
    defaultFontFamily: 'REEOCircuitDisplay',
  },
});
const png = resvg.render().asPng();
writeFileSync(new URL('../public/brand/reeo-og.png', import.meta.url), png);
console.log(`Rendered public/brand/reeo-og.png (${png.byteLength} bytes)`);
