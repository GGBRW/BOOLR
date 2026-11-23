/**
 * Release notes are fetched from the repository's latest public GitHub release.
 * The body is data, never HTML: it is parsed into plain text sections and cached
 * locally so the dialog still works offline or when the API is rate-limited.
 */
export interface ReleaseNote {
  tagName: string;
  name: string;
  body: string;
  url: string;
  publishedAt: string;
  fetchedAt: number;
  source: 'network' | 'cache' | 'fallback';
}

export interface ReleaseSection {
  title: string;
  items: string[];
}

export interface ReleaseStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ReleaseDeps {
  fetcher?: typeof fetch;
  storage?: ReleaseStorage | null;
  now?: () => number;
  ttlMs?: number;
}

const API_URL = 'https://api.github.com/repos/abdou-da0wew/REEO/releases/latest';
const RELEASES_URL = 'https://github.com/abdou-da0wew/REEO/releases';
const CACHE_KEY = 'reeo.release.v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_BODY = 50_000;
const MAX_SECTIONS = 12;
const MAX_ITEMS = 80;
const MAX_ITEM_LENGTH = 320;

const FALLBACK_BODY = `## Highlights

- Every component now shares one visual language: white bodies with strong black outlines, neutral black panels, and no default blue surfaces.
- Seven-segment and multi-digit displays use the solid rounded segment renderer and start blank until a data pin is wired.

## Fixed

- Display, seven-segment, RGB LED and RGB LED 2-bit labels no longer spill into their panels.
- Segment digits and colour channels are drawn inside their component footprints, and pins that sit between grid points can be wired reliably.

## Platforms

- Browser build, Electron desktop packages, and Capacitor Android/iOS shells are produced from the same source.`;

export const FALLBACK_RELEASE: ReleaseNote = {
  tagName: 'v2.2.0',
  name: 'REEO v2.2.0',
  body: FALLBACK_BODY,
  url: RELEASES_URL,
  publishedAt: '',
  fetchedAt: 0,
  source: 'fallback',
};

function browserStorage(): ReleaseStorage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanInline(input: string): string {
  return input
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_ITEM_LENGTH);
}

/** Convert a GitHub release body into safe, display-ready text sections. */
export function parseReleaseBody(body: string): ReleaseSection[] {
  const sections: ReleaseSection[] = [];
  let current: ReleaseSection = { title: 'Release notes', items: [] };
  let count = 0;

  const pushSection = () => {
    if (current.items.length) sections.push(current);
  };

  for (const raw of body.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('<!--') || /^[-*_]{3,}$/.test(line)) continue;

    const heading = /^#{2,3}\s+(.+)$/.exec(line);
    if (heading?.[1]) {
      pushSection();
      current = { title: cleanInline(heading[1]) || 'Release notes', items: [] };
      continue;
    }

    const bullet = /^(?:[-*+]|\d+[.)])\s+(.+)$/.exec(line);
    const text = cleanInline(bullet?.[1] ?? line);
    if (!text) continue;
    if (count >= MAX_ITEMS) break;
    current.items.push(text);
    count += 1;
  }

  pushSection();
  return sections.slice(0, MAX_SECTIONS).filter((section) => section.items.length > 0);
}

function cacheSnapshot(value: unknown): ReleaseNote | null {
  if (!isRecord(value)) return null;
  const tagName = typeof value.tagName === 'string' ? value.tagName.trim() : '';
  const body = typeof value.body === 'string' ? value.body : '';
  const fetchedAt = typeof value.fetchedAt === 'number' ? value.fetchedAt : 0;
  if (!tagName || !body || body.length > MAX_BODY || !Number.isFinite(fetchedAt)) return null;
  return {
    tagName: tagName.slice(0, 80),
    name: typeof value.name === 'string' ? value.name.slice(0, 200) : tagName,
    body,
    url:
      typeof value.url === 'string' && value.url.startsWith('https://github.com/')
        ? value.url
        : RELEASES_URL,
    publishedAt: typeof value.publishedAt === 'string' ? value.publishedAt.slice(0, 80) : '',
    fetchedAt,
    source: value.source === 'fallback' ? 'fallback' : 'cache',
  };
}

export function readCachedRelease(
  storage: ReleaseStorage | null = browserStorage(),
): ReleaseNote | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CACHE_KEY);
    if (!raw || raw.length > MAX_BODY * 2) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isRecord(parsed) && parsed.version !== 1) return null;
    return cacheSnapshot(parsed);
  } catch {
    return null;
  }
}

export function cacheRelease(
  release: ReleaseNote,
  storage: ReleaseStorage | null = browserStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(CACHE_KEY, JSON.stringify({ version: 1, ...release, source: 'cache' }));
  } catch {
    // Quota/private mode: the dialog still has the live result for this session.
  }
}

export function getReleaseSnapshot(storage: ReleaseStorage | null = browserStorage()): ReleaseNote {
  return readCachedRelease(storage) ?? FALLBACK_RELEASE;
}

function validUrl(value: unknown): string {
  if (typeof value === 'string' && value.startsWith('https://github.com/')) return value;
  return RELEASES_URL;
}

function fromApi(value: unknown, fetchedAt: number): ReleaseNote {
  if (!isRecord(value)) throw new Error('Invalid release payload');
  const tagName = typeof value.tag_name === 'string' ? value.tag_name.trim() : '';
  const body = typeof value.body === 'string' ? value.body.trim() : '';
  if (!tagName || !body || body.length > MAX_BODY) throw new Error('Invalid release');
  return {
    tagName: tagName.slice(0, 80),
    name: typeof value.name === 'string' && value.name.trim() ? value.name.slice(0, 200) : tagName,
    body,
    url: validUrl(value.html_url),
    publishedAt: typeof value.published_at === 'string' ? value.published_at.slice(0, 80) : '',
    fetchedAt,
    source: 'network',
  };
}

let inflight: Promise<ReleaseNote> | null = null;

/**
 * Return a fresh cached release immediately. Otherwise fetch the public API and
 * cache the parsed source body. Network/API failures fall back to the last cache
 * (even if stale) and finally to the built-in summary.
 */
export async function refreshLatestRelease(deps: ReleaseDeps = {}): Promise<ReleaseNote> {
  if (inflight) return inflight;
  const now = deps.now ?? Date.now;
  const storage = deps.storage === undefined ? browserStorage() : deps.storage;
  const ttlMs = deps.ttlMs ?? CACHE_TTL_MS;
  const cached = readCachedRelease(storage);
  if (cached && ttlMs > 0 && now() - cached.fetchedAt < ttlMs) return cached;

  const fetcher = deps.fetcher ?? fetch;
  inflight = (async () => {
    const controller = typeof AbortController === 'undefined' ? null : new AbortController();
    const timer = controller ? setTimeout(() => controller.abort(), 5_000) : undefined;
    try {
      const response = await fetcher(API_URL, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: controller?.signal ?? null,
      });
      if (!response.ok) throw new Error(`Release API returned ${response.status}`);
      const release = fromApi(await response.json(), now());
      cacheRelease(release, storage);
      return release;
    } catch {
      return cached ?? FALLBACK_RELEASE;
    } finally {
      if (timer) clearTimeout(timer);
      inflight = null;
    }
  })();
  return inflight;
}
