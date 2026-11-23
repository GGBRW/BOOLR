import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import config from '../vercel.json';

function header(path: string, name: string): string | undefined {
  let value: string | undefined;
  for (const rule of config.headers) {
    if (!new RegExp(`^${rule.source}$`).test(path)) continue;
    for (const item of rule.headers)
      if (item.key.toLowerCase() === name.toLowerCase()) value = item.value;
  }
  return value;
}

describe('Vercel deployment contract', () => {
  test('builds the static browser target with Bun and a frozen lockfile', () => {
    expect(config.framework).toBe('vite');
    expect(config.installCommand).toContain('ELECTRON_SKIP_BINARY_DOWNLOAD=1');
    expect(config.installCommand).toContain('bun install --frozen-lockfile');
    expect(config.buildCommand).toBe('bun run build:vercel');
    expect(config.outputDirectory).toBe('dist');
  });

  test('only fingerprinted Vite assets get immutable caching', () => {
    expect(header('/assets/index-abc123.css', 'Cache-Control')).toContain('immutable');
    for (const path of ['/', '/index.html', '/brand/reeo-mark.svg', '/brand/reeo-mark.svg']) {
      expect(header(path, 'Cache-Control')).toBe('public, max-age=0, must-revalidate');
    }
  });

  test('sets browser security headers without requiring unsafe-eval', () => {
    expect(header('/', 'X-Content-Type-Options')).toBe('nosniff');
    expect(header('/', 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('/', 'Permissions-Policy')).toContain('microphone=()');
    const policy = header('/', 'Content-Security-Policy');
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).toContain("connect-src 'self' https://api.github.com");
    expect(policy).not.toContain('unsafe-eval');
  });

  test('does not mask missing static files with a blanket SPA rewrite', () => {
    expect(Object.hasOwn(config, 'rewrites')).toBe(false);
    expect(Object.hasOwn(config, 'routes')).toBe(false);
  });

  test('excludes native outputs and local state, not browser build inputs', () => {
    const ignored = readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8').split('\n');
    for (const path of ['node_modules/', 'dist/', '.env*', 'android/', 'ios/', 'saves/']) {
      expect(ignored).toContain(path);
    }
    for (const path of ['app/', 'src/', 'public/', 'scripts/', 'bun.lock', 'electron/']) {
      expect(ignored).not.toContain(path);
    }
  });
});
