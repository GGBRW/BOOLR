import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = typeof __dirname === 'string' ? __dirname : dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;
function createWindow(): void {
  mainWindow = new BrowserWindow({
    title: 'REEO',
    width: 1200,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    icon: join(here, '../public/brand/reeo-icon.png'),
    backgroundColor: '#111111',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(here, 'preload.cjs'),
    },
  });
  void mainWindow.loadFile(join(here, '../dist/index.html'));
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.webContents.session.setPermissionRequestHandler(
    (_webContents, _permission, callback) => callback(false),
  );
}
void app.whenReady().then(() => {
  ipcMain.on('reeo:quit', (event) => {
    if (event.sender === mainWindow?.webContents) app.quit();
  });
  ipcMain.on('reeo:devtools', (event) => {
    if (!app.isPackaged && event.sender === mainWindow?.webContents)
      mainWindow.webContents.openDevTools();
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
