import { drawGhost } from './ghosts';
import { installLanguagePicker } from './language-picker';
import { installOverlays } from './overlays';
import { installHelp, openHelp } from './help';
import { drawComponentBody } from './rendering';
import { installLayout } from './layout';
import { installIcons, drawComponentIcon, circuitSVG } from './icons';
import { decodeBoard, validateCircuitData } from './board';
import { evaluateExpression } from './expression';
import { installI18n } from './i18n';
import type { MessageKey } from './i18n';
import { createStorage } from './storage';
import { runTick } from './simulation';
import { getReleaseSnapshot, parseReleaseBody, refreshLatestRelease } from './release';
import { installEditorPointers } from './interaction';
import { positionPopup } from './geometry';
import type { BoardFile, Component, Point, SavedBoard } from './types';

// These are the original simulator's globals. They stay in their original scripts;
// only this explicitly typed boundary knows about them.
declare let components: Component[];
declare let wires: unknown[];
declare let offset: Point;
declare let zoom: number;
declare let zoomAnimation: number;
declare const mouse: { screen: Point };
declare let variables: Record<string, number | string>;
declare let variableReferences: Record<string, unknown[]>;
declare let openedSaveFile: SavedBoard | undefined;
declare const savesFolder: string;
declare function stringify(parts: Component[], connections: unknown[]): string;
declare function readSaveFiles(): void;
declare function openSaveFile(save: SavedBoard): void;
declare function createFileName(name: string): string;
declare function setLocalStorage(): void;
declare function saveCustomComponents(): void;
declare function changeZoom(delta: number): void;
declare const toolbar: { message(text: string): void };
declare const mainMenu: HTMLElement & { hide(): void };

function memoryStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => {
      entries.delete(key);
    },
    setItem: (key, value) => {
      entries.set(key, value);
    },
  };
}
let store: Storage;
let persistent = true;
try {
  store = localStorage;
  store.setItem('reeo.storage-test', '1');
  store.removeItem('reeo.storage-test');
} catch {
  store = memoryStorage();
  persistent = false;
}
const storage = createStorage(store);
window.__dirname = '/reeo';
Object.defineProperty(window, 'require', {
  value: (name: string) => {
    if (name === 'fs') return storage;
    if (name === 'electron')
      return {
        remote: {
          getCurrentWindow: () => ({
            webContents: { openDevTools: () => window.reeoDesktop?.openDevTools() },
          }),
        },
      };
    throw new Error(`REEO does not expose the ${name} module to the renderer.`);
  },
});
window.reeoPositionPopup = positionPopup;
window.reeoTick = runTick;
window.reeoExpression = evaluateExpression;
window.reeoValidateCircuit = validateCircuitData;
installI18n();
const t = (key: MessageKey) => window.reeoI18n.t(key);
function message(key: MessageKey): void {
  toolbar.message(t(key));
}
function snapshot(): BoardFile {
  return {
    name: openedSaveFile?.name ?? 'REEO board',
    offset: { ...offset },
    zoom,
    variables,
    variableReferences,
    data: stringify(components, wires),
  };
}
function persist(): void {
  try {
    setLocalStorage();
    saveCustomComponents();
    if (openedSaveFile)
      storage.writeFileSync(savesFolder + openedSaveFile.fileName, JSON.stringify(snapshot()));
  } catch {
    message('storageError');
  }
}
window.reeoRelease = {
  current: () => getReleaseSnapshot(),
  refresh: () => refreshLatestRelease(),
  sections: (release) => parseReleaseBody(release.body),
};
window.reeo = {
  version: '2.1.0',
  storage,
  exportBoard() {
    const board = snapshot();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(board)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `${board.name.replace(/[^\p{L}\p{N}_-]/gu, '-').slice(0, 100) || 'REEO'}.board`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  importBoard() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.board,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void window.reeo.importFile(file);
    };
    input.click();
  },
  async importFile(file) {
    try {
      if (file.size > 2_000_000) throw new Error('File too large');
      const decoded = decodeBoard(await file.text());
      const board: BoardFile = Array.isArray(decoded)
        ? {
            name: file.name.replace(/\.board$/i, ''),
            offset: { x: 0, y: 0 },
            zoom: 100,
            variables: {},
            variableReferences: {},
            data: JSON.stringify(decoded),
          }
        : decoded;
      persist();
      const filename = createFileName(board.name);
      storage.writeFileSync(savesFolder + filename, JSON.stringify(board));
      readSaveFiles();
      openSaveFile({
        name: board.name,
        fileName: filename,
        fileSize: file.size,
        location: savesFolder + filename,
      });
      mainMenu.hide();
    } catch {
      message('invalidFile');
    }
  },
  quit() {
    persist();
    if (window.reeoDesktop) window.reeoDesktop.quit();
    else message('storageNotice');
  },
};
function showGuide(): void {
  openHelp();
}
document.addEventListener('DOMContentLoaded', () => {
  const quit = document.querySelector<HTMLButtonElement>('#reeo-quit');
  if (quit && !window.reeoDesktop) quit.style.display = 'none';
  document
    .querySelector('#reeo-language')
    ?.addEventListener('change', (event) =>
      window.reeoI18n.setLocale((event.target as HTMLSelectElement).value),
    );
  document
    .querySelector('#reeo-export')
    ?.addEventListener('click', () => window.reeo.exportBoard());
  document
    .querySelector('#reeo-import')
    ?.addEventListener('click', () => window.reeo.importBoard());
  document.querySelector('#reeo-help')?.addEventListener('click', showGuide);
  document.getElementById('reeo-add')?.addEventListener('click', () => {
    document
      .querySelector<HTMLElement>('#toolbar > .slot')
      ?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
  });
  document.getElementById('reeo-fit')?.addEventListener('click', () => {
    const parts = components as (Component & { width: number; height: number })[];
    if (!parts.length) return;
    const left = Math.min(...parts.map((p) => p.pos.x)) - 2;
    const right = Math.max(...parts.map((p) => p.pos.x + p.width)) + 2;
    const top = Math.max(...parts.map((p) => p.pos.y)) + 2;
    const bottom = Math.min(...parts.map((p) => p.pos.y - p.height)) - 2;
    zoom = Math.max(
      2,
      Math.min(100, (innerWidth - 32) / (right - left), (innerHeight - 240) / (top - bottom)),
    );
    zoomAnimation = zoom;
    zoom = zoomAnimation;
    offset.x = (left + right) / 2 - innerWidth / (2 * zoom);
    offset.y = (top + bottom) / 2 + (innerHeight + 60) / (2 * zoom);
  });
  const zoomView = (delta: number) => {
    mouse.screen.x = innerWidth / 2;
    mouse.screen.y = innerHeight / 2;
    changeZoom(delta);
  };
  document.querySelector('#reeo-zoom-in')?.addEventListener('click', () => zoomView(20));
  document.querySelector('#reeo-zoom-out')?.addEventListener('click', () => zoomView(-20));
  const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
  if (canvas) {
    canvas.setAttribute('aria-label', 'REEO circuit editor');
    installEditorPointers(canvas);
  }
  for (const slot of document.querySelectorAll<HTMLElement>('#toolbar .slot')) {
    slot.tabIndex = 0;
    slot.setAttribute('role', 'button');
    slot.setAttribute(
      'aria-label',
      slot.getAttribute('tooltip') ?? slot.textContent ?? 'Component',
    );
    slot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        slot.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
        slot.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
      }
    });
  }
  const originalTitle = document.title;
  window.addEventListener('unhandledrejection', (event) => {
    console.error(event.reason);
    message('storageError');
  });
  document.title = originalTitle.replaceAll('BOOLR', 'REEO');
  setInterval(persist, 15000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist();
  });
  window.addEventListener('pagehide', persist);
  if (!persistent) setTimeout(() => message('storageError'), 1000);
});

window.reeoDrawComponentIcon = drawComponentIcon;
window.reeoCircuitSVG = circuitSVG;
installIcons();

installLayout();

window.reeoHelp = { open: openHelp };
window.reeoDrawComponentBody = drawComponentBody;
installHelp();

installLanguagePicker();
installOverlays();

window.reeoDrawGhost = drawGhost;
