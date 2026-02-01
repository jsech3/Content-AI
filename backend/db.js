import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'data.json');

function load() {
  if (!existsSync(DB_PATH)) return { scripts: [] };
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function save(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const db = {
  getScripts() {
    return load().scripts;
  },

  getScript(id) {
    return load().scripts.find(s => s.id === id) || null;
  },

  insertScript(script) {
    const data = load();
    data.scripts.push({ ...script, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    save(data);
  },

  updateScript(id, updates) {
    const data = load();
    const idx = data.scripts.findIndex(s => s.id === id);
    if (idx === -1) return false;
    data.scripts[idx] = { ...data.scripts[idx], ...updates, updated_at: new Date().toISOString() };
    save(data);
    return true;
  },

  deleteScript(id) {
    const data = load();
    const before = data.scripts.length;
    data.scripts = data.scripts.filter(s => s.id !== id);
    save(data);
    return data.scripts.length < before;
  },

  getStats() {
    const scripts = load().scripts;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      total: scripts.length,
      generated: scripts.filter(s => s.status === 'generated').length,
      drafts: scripts.filter(s => s.status === 'draft').length,
      published: scripts.filter(s => s.status === 'published').length,
      thisWeek: scripts.filter(s => new Date(s.created_at) >= weekAgo).length,
      recentScripts: scripts.slice(-5).reverse(),
    };
  },
};

export default db;
