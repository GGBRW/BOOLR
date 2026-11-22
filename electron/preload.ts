import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopBridge } from '../src/types';
contextBridge.exposeInMainWorld(
  'reeoDesktop',
  Object.freeze({
    platform: process.platform,
    quit: () => ipcRenderer.send('reeo:quit'),
    openDevTools: () => ipcRenderer.send('reeo:devtools'),
  } satisfies DesktopBridge),
);
