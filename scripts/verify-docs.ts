import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const markdownRoots = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'CODE_OF_CONDUCT.md',
  'docs',
  'public/brand/README.md',
  '.github',
];

async function collect(path: string, files: string[]): Promise<void> {
  const info = await stat(path).catch(() => null);
  if (!info) return;
  if (info.isDirectory()) {
    for (const entry of await readdir(path)) {
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
      await collect(join(path, entry), files);
    }
    return;
  }
  if (path.endsWith('.md')) files.push(path);
}

function slug(heading: string): string {
  return heading
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function headings(text: string): Set<string> {
  const found = new Set<string>();
  const counts = new Map<string, number>();
  for (const line of text.split('\n')) {
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match?.[2]) continue;
    const base = slug(match[2]);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    found.add(count === 0 ? base : `${base}-${count}`);
  }
  return found;
}

const files: string[] = [];
for (const entry of markdownRoots) await collect(join(root, entry), files);

const cache = new Map<string, Set<string> | null>();
async function anchorsFor(path: string): Promise<Set<string> | null> {
  if (cache.has(path)) return cache.get(path) ?? null;
  try {
    const set = headings(await readFile(path, 'utf8'));
    cache.set(path, set);
    return set;
  } catch {
    cache.set(path, null);
    return null;
  }
}

const failures: string[] = [];
let checked = 0;

for (const file of files) {
  const text = await readFile(file, 'utf8');
  const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const match of text.matchAll(linkPattern)) {
    const raw = match[1];
    if (!raw || /^(?:https?:|mailto:|tel:|data:)/i.test(raw) || raw.startsWith('#')) continue;
    checked += 1;
    const [targetPart, anchorPart] = raw.replace(/^<|>$/g, '').split('#');
    const target = targetPart ? resolve(dirname(file), decodeURIComponent(targetPart)) : file;
    if (!target.startsWith(root)) {
      failures.push(`${relative(root, file)}: link escapes the repository: ${raw}`);
      continue;
    }
    const targetInfo = await stat(target).catch(() => null);
    if (!targetInfo) {
      failures.push(`${relative(root, file)}: missing target ${raw}`);
      continue;
    }
    if (!anchorPart || !target.endsWith('.md')) continue;
    const anchors = await anchorsFor(target);
    if (!anchors) continue;
    const normalized = decodeURIComponent(anchorPart).toLowerCase();
    if (!anchors.has(normalized)) {
      failures.push(
        `${relative(root, file)}: missing anchor #${anchorPart} in ${relative(root, target)}`,
      );
    }
  }
}

if (failures.length) {
  console.error(`Documentation links check failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Documentation links check passed: ${files.length} files, ${checked} internal links.`);
