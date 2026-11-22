import type { StorageAdapter } from './types';
const PREFIX = 'reeo.files.v1:';
/** A deliberately narrow filesystem-shaped adapter, never an OS filesystem bridge. */
export function createStorage(store: Storage): StorageAdapter {
  function normalize(path: string): string {
    const match = /\/(saves\/[^/]+\.board|data\/customcomponents\.json)$/.exec(path);
    const name = match?.[1];
    if (!name || name.includes('..')) throw new Error('Unsupported REEO storage path');
    return name;
  }
  const read = (path: string): string => {
    const name = normalize(path);
    const text = store.getItem(PREFIX + name);
    if (text !== null) return text;
    if (name === 'data/customcomponents.json') return '[[],[]]';
    throw new Error('Board not found');
  };
  const write = (path: string, text: string) => {
    store.setItem(PREFIX + normalize(path), text);
  };
  return {
    readdirSync(directory) {
      if (!directory.endsWith('/saves/')) throw new Error('Unsupported REEO directory');
      return Array.from({ length: store.length }, (_, i) => store.key(i))
        .filter((key): key is string => key?.startsWith(`${PREFIX}saves/`) === true)
        .map((key) => key.slice(`${PREFIX}saves/`.length))
        .sort();
    },
    readFileSync: read,
    writeFileSync: write,
    writeFile(path, text, _encoding, callback) {
      try {
        write(path, text);
        callback(null);
      } catch (error) {
        callback(error instanceof Error ? error : new Error('Storage failed'));
      }
    },
    statSync(path) {
      return { size: new TextEncoder().encode(read(path)).length };
    },
    unlink(path, callback) {
      try {
        store.removeItem(PREFIX + normalize(path));
        callback(null);
      } catch (error) {
        callback(error instanceof Error ? error : new Error('Delete failed'));
      }
    },
  } satisfies StorageAdapter;
}
