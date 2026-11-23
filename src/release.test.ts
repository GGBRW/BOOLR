import { describe, expect, test } from 'bun:test';
import {
  FALLBACK_RELEASE,
  cacheRelease,
  getReleaseSnapshot,
  parseReleaseBody,
  readCachedRelease,
  refreshLatestRelease,
  type ReleaseStorage,
} from './release';

class MemoryStorage implements ReleaseStorage {
  private values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const release = (tag = 'v9.9.9', body = '## Highlights\n- Live release notes') => ({
  tag_name: tag,
  name: `REEO ${tag}`,
  body,
  html_url: `https://github.com/abdou-da0wew/REEO/releases/tag/${tag}`,
  published_at: '2026-11-23T00:00:00Z',
});

describe('release note parsing', () => {
  test('turns headings and bullets into safe plain-text sections', () => {
    const sections = parseReleaseBody(
      [
        '## Highlights',
        '- **Dynamic** [release notes](https://example.com) with `code`',
        '- A second item',
        '',
        '### Fixes',
        '- Removed <b>unsafe</b> HTML &amp; markup',
      ].join('\n'),
    );
    expect(sections).toEqual([
      { title: 'Highlights', items: ['Dynamic release notes with code', 'A second item'] },
      { title: 'Fixes', items: ['Removed unsafe HTML & markup'] },
    ]);
  });

  test('ignores empty bodies and caps the number of items', () => {
    expect(parseReleaseBody('')).toEqual([]);
    const body = Array.from({ length: 100 }, (_, index) => `- item ${index}`).join('\n');
    const sections = parseReleaseBody(body);
    expect(sections[0]?.items).toHaveLength(80);
  });
});

describe('release cache', () => {
  test('round-trips the latest release and prefers it synchronously', () => {
    const storage = new MemoryStorage();
    cacheRelease(
      {
        ...FALLBACK_RELEASE,
        tagName: 'v3.0.0',
        body: '## Highlights\n- Cached',
        fetchedAt: 123,
      },
      storage,
    );
    expect(readCachedRelease(storage)?.tagName).toBe('v3.0.0');
    expect(getReleaseSnapshot(storage).source).toBe('cache');
  });

  test('ignores malformed cache data', () => {
    const storage = new MemoryStorage();
    storage.setItem('reeo.release.v1', '{not json');
    expect(readCachedRelease(storage)).toBeNull();
  });
});

describe('latest release refresh', () => {
  test('fetches and caches a release from the public API', async () => {
    const storage = new MemoryStorage();
    const result = await refreshLatestRelease({
      storage,
      fetcher: (async () =>
        new Response(JSON.stringify(release()), { status: 200 })) as unknown as typeof fetch,
    });
    expect(result.source).toBe('network');
    expect(result.tagName).toBe('v9.9.9');
    expect(readCachedRelease(storage)?.tagName).toBe('v9.9.9');
  });

  test('returns fresh cache without making a request', async () => {
    const storage = new MemoryStorage();
    const cachedAt = Date.now();
    cacheRelease(
      {
        ...FALLBACK_RELEASE,
        tagName: 'v2.1.0',
        body: '## Highlights\n- Cached',
        fetchedAt: cachedAt,
      },
      storage,
    );
    let calls = 0;
    const result = await refreshLatestRelease({
      storage,
      now: () => cachedAt + 1_000,
      fetcher: (async () => {
        calls += 1;
        return new Response('{}', { status: 500 });
      }) as unknown as typeof fetch,
    });
    expect(calls).toBe(0);
    expect(result.tagName).toBe('v2.1.0');
  });

  test('uses the stale cache and then the fallback when the API fails', async () => {
    const storage = new MemoryStorage();
    cacheRelease(
      {
        ...FALLBACK_RELEASE,
        tagName: 'v2.0.0',
        body: '## Highlights\n- Stale',
        fetchedAt: 1,
      },
      storage,
    );
    const failed = (async () => new Response('nope', { status: 503 })) as unknown as typeof fetch;
    const result = await refreshLatestRelease({
      storage,
      now: () => 10_000_000,
      ttlMs: 1,
      fetcher: failed,
    });
    expect(result.tagName).toBe('v2.0.0');
    expect(result.source).toBe('cache');

    const empty = await refreshLatestRelease({
      storage: new MemoryStorage(),
      fetcher: failed,
    });
    expect(empty.source).toBe('fallback');
    expect(empty.tagName).toBe(FALLBACK_RELEASE.tagName);
  });
});
