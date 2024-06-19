import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'fs';
import Store from 'electron-store';

const store = new Store();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 450,
    height: 750,
    center: true,
    minHeight: 750,
    minWidth: 450,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

 Menu.setApplicationMenu(null);
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

ipcMain.handle('load-albums', async () => {
  return await store.get('albums', []);
});


ipcMain.on('save-albums', (_, albums) => {
  store.set('albums', albums);
});

ipcMain.handle('save-file', async (_, filePath) => {
  const fileName = path.basename(filePath);
  const destDir = path.join(app.getPath('userData'), 'media');
  const destPath = path.join(destDir, fileName);

  // Ensure the destination directory exists
  try {
    await fs.promises.mkdir(destDir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory', err);
    throw err;
  }

  // Copy the file to the destination directory
  try {
    await fs.promises.copyFile(filePath, destPath);
    return destPath;
  } catch (err) {
    console.error('Error copying file', err);
    throw err;
  }
});