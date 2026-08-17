import { getDB } from './db.js';

const STORES = ['exercises', 'workouts', 'templates', 'routines'];

export async function exportData() {
  const db = await getDB();
  const data = { version: 1, exported_at: new Date().toISOString() };
  for (const store of STORES) {
    data[store] = await db.getAll(store);
  }
  return data;
}

export async function downloadBackup() {
  const data = await exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-tracker-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importData(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
  for (const store of STORES) {
    if (!Array.isArray(data[store])) throw new Error(`Backup file is missing "${store}" data`);
  }

  const db = await getDB();
  const tx = db.transaction(STORES, 'readwrite');
  for (const store of STORES) {
    await tx.objectStore(store).clear();
    for (const record of data[store]) {
      await tx.objectStore(store).put(record);
    }
  }
  await tx.done;
}

export async function readBackupFile(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  return data;
}
