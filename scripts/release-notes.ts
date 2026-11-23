#!/usr/bin/env bun
/**
 * Print the changelog section for a release tag as the GitHub release body.
 * Usage: bun scripts/release-notes.ts v2.1.0
 */
import { readFileSync } from 'node:fs';

const rawVersion = process.argv[2]?.trim();
if (!rawVersion) {
  console.error('Usage: bun scripts/release-notes.ts <tag>');
  process.exit(1);
}
const version = rawVersion.replace(/^v/i, '');
const lines = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8').split('\n');
const start = lines.findIndex((line) => {
  const heading = /^##\s+(.+)$/.exec(line);
  return heading?.[1]?.includes(version) ?? false;
});
if (start < 0) {
  console.error(`No changelog section for ${rawVersion}`);
  process.exit(1);
}
const next = lines.findIndex((line, index) => index > start && /^##\s+/.test(line));
const body = lines
  .slice(start + 1, next < 0 ? undefined : next)
  .join('\n')
  .trim();
if (!body) {
  console.error(`Empty changelog section for ${rawVersion}`);
  process.exit(1);
}
console.log(body);
