import { openDB } from 'idb';
import { SEED_EXERCISES } from './seedExercises.js';

const DB_NAME = 'workout-tracker';
const DB_VERSION = 2;

let dbPromise;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const exercises = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
          exercises.createIndex('name', 'name', { unique: true });
          exercises.createIndex('category', 'category');

          const workouts = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
          workouts.createIndex('started_at', 'started_at');

          const templates = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
          templates.createIndex('name', 'name', { unique: true });

          db.createObjectStore('routines', { keyPath: 'id', autoIncrement: true });
        }
        if (oldVersion < 2) {
          // Routine guidance was removed — drop the now-unused store.
          if (db.objectStoreNames.contains('routines')) db.deleteObjectStore('routines');
        }
      },
    }).then(async (db) => {
      await seedIfEmpty(db);
      return db;
    });
  }
  return dbPromise;
}

async function seedIfEmpty(db) {
  const count = await db.count('exercises');
  if (count > 0) return;
  const tx = db.transaction('exercises', 'readwrite');
  const now = new Date().toISOString();
  for (const [id, name, category, equipment, muscles] of SEED_EXERCISES) {
    await tx.store.put({
      id,
      name,
      category,
      equipment,
      is_custom: false,
      muscles: muscles.map(([muscle, role]) => ({ muscle, role })),
      created_at: now,
    });
  }
  await tx.done;
}
