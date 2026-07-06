import { app, BrowserWindow, ipcMain } from 'electron';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { askMentor, askTutorChat, checkAnswers } from './openrouter.js';
import { getApiKey, getProgress, saveProgress, setApiKey } from './storage.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const isDev = !app.isPackaged;

function configurePortableMode() {
  if (isDev) return;

  const appDir = dirname(process.execPath);
  const markerPath = join(appDir, 'portable.flag');
  if (existsSync(markerPath)) {
    app.setPath('userData', join(appDir, 'data'));
  }
}

configurePortableMode();

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#09090b',
    title: 'Learning Mentor',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL('http://127.0.0.1:5173');
  } else {
    win.loadFile(join(__dirname, '../../dist/renderer/index.html'));
  }
}

app.whenReady().then(() => {
  getProgress();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('progress:get', () => getProgress());
ipcMain.handle('progress:save', (_event, data) => saveProgress(data));
ipcMain.handle('mentor:ask', (_event, completed, retry) => askMentor(completed, retry));
ipcMain.handle('mentor:check', (_event, exam, userAnswers) => checkAnswers(exam, userAnswers));
ipcMain.handle('mentor:chat', (_event, history, context) => askTutorChat(history, context));
ipcMain.handle('settings:get-api-key', () => getApiKey());
ipcMain.handle('settings:set-api-key', (_event, key) => setApiKey(key));
