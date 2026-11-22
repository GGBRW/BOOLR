import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const root = resolve('dist');
const htmlPath = resolve(root, 'index.html');
if (!existsSync(htmlPath)) throw new Error('Missing dist/index.html; run bun run build:web first.');
const html = readFileSync(htmlPath, 'utf8');
const failures: string[] = [];
let checked = 0;

function verifyReference(reference: string, source: string): void {
  if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(reference)) return;
  const path = decodeURIComponent(reference.split(/[?#]/)[0] ?? '');
  if (!path) return;
  const target = path.startsWith('/') ? resolve(root, `.${path}`) : resolve(dirname(source), path);
  if (relative(root, target).startsWith('..') || !existsSync(target)) {
    failures.push(`${relative(root, source)} → ${reference}`);
  }
  checked++;
}

for (const match of html.matchAll(
  /<(?:script|link|img)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi,
)) {
  if (match[1]) verifyReference(match[1], htmlPath);
}
for (const file of readdirSync(resolve(root, 'assets'))) {
  if (!file.endsWith('.css')) continue;
  const source = resolve(root, 'assets', file);
  for (const match of readFileSync(source, 'utf8').matchAll(
    /url\(\s*["']?([^\s"')]+)["']?\s*\)/g,
  )) {
    if (match[1]) verifyReference(match[1], source);
  }
}
for (const path of [
  'js/startup.js',
  'js/components.js',
  'brand/reeo-mark.svg',
  'brand/reeo-icon.png',
]) {
  if (!existsSync(resolve(root, path))) failures.push(path);
}
if (failures.length)
  throw new Error(`Missing or invalid deployment assets:\n${failures.join('\n')}`);
console.log(`Verified ${checked} local HTML/CSS asset references and required REEO runtime files.`);
