import { app } from 'electron';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const defaultProgress = {
  completed: [],
  retry: [],
  streak: 1,
  lastVisit: null
};

function loadEnvApiKey() {
  const candidates = [
    resolve(process.cwd(), '.env'),
    join(app.getAppPath(), '.env'),
    join(dirname(process.execPath), '.env'),
    join(app.getPath('userData'), '.env')
  ];

  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const line = readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .find((value) => value.trim().startsWith('OPENROUTER_API_KEY='));

    if (line) {
      return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '') || null;
    }
  }

  return null;
}

function getProgressPath() {
  return join(app.getPath('userData'), 'progress.json');
}

function getSettingsPath() {
  return join(app.getPath('userData'), 'settings.json');
}

function ensureFile(path, fallback) {
  if (!existsSync(dirname(path))) {
    mkdirSync(dirname(path), { recursive: true });
  }

  if (!existsSync(path)) {
    writeFileSync(path, JSON.stringify(fallback, null, 2), 'utf8');
  }
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const start = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const end = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((end - start) / 86400000);
}

function normalizeProgress(data) {
  return {
    completed: Array.isArray(data?.completed) ? data.completed : [],
    retry: Array.isArray(data?.retry) ? data.retry : [],
    streak: Number.isFinite(data?.streak) && data.streak > 0 ? data.streak : 1,
    lastVisit: typeof data?.lastVisit === 'string' ? data.lastVisit : null
  };
}

export function getProgress() {
  const path = getProgressPath();
  ensureFile(path, defaultProgress);

  let progress = defaultProgress;
  try {
    progress = normalizeProgress(JSON.parse(readFileSync(path, 'utf8')));
  } catch {
    progress = { ...defaultProgress };
  }

  const today = todayKey();
  if (progress.lastVisit !== today) {
    if (progress.lastVisit) {
      const diff = daysBetween(new Date(`${progress.lastVisit}T00:00:00Z`), new Date(`${today}T00:00:00Z`));
      progress.streak = diff === 1 ? progress.streak + 1 : 1;
    } else {
      progress.streak = 1;
    }

    progress.lastVisit = today;
    saveProgress(progress);
  }

  return progress;
}

export function saveProgress(data) {
  const path = getProgressPath();
  ensureFile(path, defaultProgress);
  const progress = normalizeProgress(data);
  writeFileSync(path, JSON.stringify(progress, null, 2), 'utf8');
}

export function getApiKey() {
  const settingsPath = getSettingsPath();
  const envKey = process.env.OPENROUTER_API_KEY?.trim() || loadEnvApiKey();

  ensureFile(settingsPath, { apiKey: '' });
  try {
    const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    return settings.apiKey?.trim() || envKey || null;
  } catch {
    return envKey || null;
  }
}

export function setApiKey(key) {
  const settingsPath = getSettingsPath();
  ensureFile(settingsPath, { apiKey: '' });
  writeFileSync(settingsPath, JSON.stringify({ apiKey: key?.trim() || '' }, null, 2), 'utf8');
}
