// Client-side "API" — everything lives in IndexedDB in this browser. Method
// names/shapes mirror what used to be a REST client on purpose, so the UI
// components didn't need to change when the server was removed.
import { getDB } from './db.js';
import { MUSCLE_GROUPS } from './constants.js';

function nowISO() {
  return new Date().toISOString();
}

function nextSeq(doc) {
  doc._seq = (doc._seq || 0) + 1;
  return doc._seq;
}

function matchesSearch(name, search) {
  return !search || name.toLowerCase().includes(search.toLowerCase());
}

// ---------------------------------------------------------------- Exercises

async function listExercises(params = {}) {
  const { search = '', category = '', muscle = '' } = params;
  const db = await getDB();
  const all = await db.getAll('exercises');
  return all
    .filter((ex) => matchesSearch(ex.name, search))
    .filter((ex) => !category || ex.category === category)
    .filter((ex) => !muscle || ex.muscles.some((m) => m.muscle === muscle))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getExercise(id) {
  const db = await getDB();
  return db.get('exercises', Number(id));
}

async function createExercise({ name, category = 'full_body', equipment = 'bodyweight', muscles = [] }) {
  if (!name || !name.trim()) throw new Error('name is required');
  if (!Array.isArray(muscles) || muscles.length === 0) {
    throw new Error('at least one muscle tag is required');
  }
  const validNames = new Set(MUSCLE_GROUPS.map((m) => m.name));
  for (const m of muscles) {
    if (!validNames.has(m.muscle)) throw new Error(`Unknown muscle group: ${m.muscle}`);
  }

  const db = await getDB();
  const existing = await db.getFromIndex('exercises', 'name', name.trim());
  if (existing) throw new Error('An exercise with that name already exists');

  const record = {
    name: name.trim(),
    category,
    equipment,
    is_custom: true,
    muscles: muscles.map((m) => ({ muscle: m.muscle, role: m.role === 'secondary' ? 'secondary' : 'primary' })),
    created_at: nowISO(),
  };
  const id = await db.add('exercises', record);
  return { ...record, id };
}

async function deleteExercise(id) {
  const db = await getDB();
  const ex = await db.get('exercises', Number(id));
  if (!ex) throw new Error('Exercise not found');
  if (!ex.is_custom) throw new Error('Only custom exercises can be deleted');
  await db.delete('exercises', Number(id));
  return null;
}

async function lastPerformance(exerciseId) {
  const db = await getDB();
  const workouts = await db.getAllFromIndex('workouts', 'started_at');
  workouts.reverse(); // most recent first
  const id = Number(exerciseId);
  for (const w of workouts) {
    const we = w.exercises.find((e) => e.exercise_id === id);
    if (we && we.sets.length > 0) {
      return {
        sets: we.sets.map((s) => ({
          set_number: s.set_number,
          reps: s.reps,
          weight: s.weight,
          weight_unit: s.weight_unit,
          rpe: s.rpe,
          is_warmup: s.is_warmup,
        })),
      };
    }
  }
  return { sets: [] };
}

async function exerciseHistory(exerciseId) {
  const db = await getDB();
  const workouts = await db.getAllFromIndex('workouts', 'started_at');
  const id = Number(exerciseId);
  const rows = [];
  for (const w of workouts) {
    const we = w.exercises.find((e) => e.exercise_id === id);
    if (!we) continue;
    const workingSets = we.sets.filter((s) => !s.is_warmup);
    if (workingSets.length === 0) continue;
    const loggedWeights = workingSets.map((s) => s.weight).filter((w) => w != null);
    const maxWeight = loggedWeights.length ? Math.max(...loggedWeights) : null;
    const volume = workingSets.reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0);
    rows.push({ workout_id: w.id, started_at: w.started_at, max_weight: maxWeight, volume });
  }
  return rows;
}

async function listMuscleGroups() {
  return MUSCLE_GROUPS.map((m, i) => ({ id: i + 1, ...m }));
}

// ------------------------------------------------------------------ Workouts

function workoutSummary(w) {
  const exercise_count = w.exercises.length;
  const set_count = w.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const { exercises, _seq, ...rest } = w;
  void exercises;
  void _seq;
  return { ...rest, exercise_count, set_count };
}

async function listWorkouts(params = {}) {
  const limit = Math.min(Number(params.limit) || 50, 200);
  const db = await getDB();
  const all = await db.getAllFromIndex('workouts', 'started_at');
  all.reverse();
  return all.slice(0, limit).map(workoutSummary);
}

async function getWorkout(id) {
  const db = await getDB();
  const w = await db.get('workouts', Number(id));
  if (!w) return null;
  const { _seq, ...rest } = w;
  void _seq;
  return rest;
}

async function startWorkout({ name = 'Workout', template_id = null }) {
  const db = await getDB();
  const workout = {
    name,
    started_at: nowISO(),
    completed_at: null,
    template_id: template_id ?? null,
    notes: '',
    _seq: 0,
    exercises: [],
  };

  if (template_id) {
    const template = await db.get('templates', Number(template_id));
    if (template) {
      workout.exercises = template.exercises.map((te) => ({
        id: nextSeq(workout),
        exercise_id: te.exercise_id,
        exercise_name: te.exercise_name,
        category: te.category,
        equipment: te.equipment,
        order_index: te.order_index,
        sets: [],
      }));
    }
  }

  const id = await db.add('workouts', workout);
  return getWorkout(id);
}

async function updateWorkout(id, { name, notes, completed_at } = {}) {
  const db = await getDB();
  const w = await db.get('workouts', Number(id));
  if (!w) throw new Error('Workout not found');
  if (name != null) w.name = name;
  if (notes != null) w.notes = notes;
  if (completed_at != null) w.completed_at = completed_at;
  await db.put('workouts', w);
  return getWorkout(id);
}

async function completeWorkout(id) {
  return updateWorkout(id, { completed_at: nowISO() });
}

async function deleteWorkout(id) {
  const db = await getDB();
  await db.delete('workouts', Number(id));
  return null;
}

async function addExerciseToWorkout(workoutId, exerciseId) {
  const db = await getDB();
  const w = await db.get('workouts', Number(workoutId));
  if (!w) throw new Error('Workout not found');
  const exercise = await db.get('exercises', Number(exerciseId));
  if (!exercise) throw new Error('Invalid exercise_id');

  const maxOrder = w.exercises.reduce((max, e) => Math.max(max, e.order_index), -1);
  w.exercises.push({
    id: nextSeq(w),
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    category: exercise.category,
    equipment: exercise.equipment,
    order_index: maxOrder + 1,
    sets: [],
  });
  await db.put('workouts', w);
  return getWorkout(workoutId);
}

async function removeExerciseFromWorkout(workoutId, weId) {
  const db = await getDB();
  const w = await db.get('workouts', Number(workoutId));
  if (!w) throw new Error('Workout not found');
  w.exercises = w.exercises.filter((e) => e.id !== Number(weId));
  await db.put('workouts', w);
  return getWorkout(workoutId);
}

async function addSet(workoutId, weId, payload = {}) {
  const db = await getDB();
  const w = await db.get('workouts', Number(workoutId));
  if (!w) throw new Error('Workout not found');
  const we = w.exercises.find((e) => e.id === Number(weId));
  if (!we) throw new Error('Not found');

  const { reps = null, weight = null, weight_unit = 'lb', rpe = null, is_warmup = false } = payload;
  const setId = nextSeq(w);
  we.sets.push({
    id: setId,
    set_number: we.sets.length + 1,
    reps,
    weight,
    weight_unit,
    rpe,
    is_warmup: Boolean(is_warmup),
    completed_at: nowISO(),
  });
  await db.put('workouts', w);
  return { id: setId, workout: await getWorkout(workoutId) };
}

async function updateSet(workoutId, setId, payload = {}) {
  const db = await getDB();
  const w = await db.get('workouts', Number(workoutId));
  if (!w) throw new Error('Workout not found');
  for (const we of w.exercises) {
    const set = we.sets.find((s) => s.id === Number(setId));
    if (set) {
      if (payload.reps !== undefined) set.reps = payload.reps;
      if (payload.weight !== undefined) set.weight = payload.weight;
      if (payload.weight_unit !== undefined) set.weight_unit = payload.weight_unit;
      if (payload.rpe !== undefined) set.rpe = payload.rpe;
      if (payload.is_warmup !== undefined) set.is_warmup = Boolean(payload.is_warmup);
      await db.put('workouts', w);
      return getWorkout(workoutId);
    }
  }
  throw new Error('Not found');
}

async function deleteSet(workoutId, setId) {
  const db = await getDB();
  const w = await db.get('workouts', Number(workoutId));
  if (!w) throw new Error('Workout not found');
  for (const we of w.exercises) {
    const before = we.sets.length;
    we.sets = we.sets.filter((s) => s.id !== Number(setId));
    if (we.sets.length !== before) {
      we.sets.forEach((s, i) => (s.set_number = i + 1));
      await db.put('workouts', w);
      return getWorkout(workoutId);
    }
  }
  throw new Error('Not found');
}

// ----------------------------------------------------------------- Templates

async function listTemplates() {
  const db = await getDB();
  const all = await db.getAll('templates');
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

async function getTemplate(id) {
  const db = await getDB();
  return db.get('templates', Number(id));
}

async function buildTemplateExercises(db, exercises) {
  const rows = [];
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const exercise = await db.get('exercises', Number(ex.exercise_id));
    rows.push({
      exercise_id: ex.exercise_id,
      exercise_name: exercise?.name ?? ex.exercise_name ?? 'Unknown exercise',
      category: exercise?.category,
      equipment: exercise?.equipment,
      order_index: i,
      target_sets: ex.target_sets ?? 3,
      target_reps: ex.target_reps ?? '8-12',
      target_weight: ex.target_weight ?? null,
    });
  }
  return rows;
}

async function createTemplate({ name, description = '', exercises = [] }) {
  if (!name || !name.trim()) throw new Error('name is required');
  const db = await getDB();
  const existing = await db.getFromIndex('templates', 'name', name.trim());
  if (existing) throw new Error('A template with that name already exists');

  const record = {
    name: name.trim(),
    description,
    created_at: nowISO(),
    exercises: await buildTemplateExercises(db, exercises),
  };
  const id = await db.add('templates', record);
  return { ...record, id };
}

async function updateTemplate(id, { name, description, exercises } = {}) {
  const db = await getDB();
  const t = await db.get('templates', Number(id));
  if (!t) throw new Error('Template not found');
  if (name != null) t.name = name;
  if (description != null) t.description = description;
  if (Array.isArray(exercises)) t.exercises = await buildTemplateExercises(db, exercises);
  await db.put('templates', t);
  return t;
}

async function deleteTemplate(id) {
  const db = await getDB();
  await db.delete('templates', Number(id));
  return null;
}

async function saveTemplateFromWorkout(workoutId, name) {
  if (!name || !name.trim()) throw new Error('name is required');
  const db = await getDB();
  const existing = await db.getFromIndex('templates', 'name', name.trim());
  if (existing) throw new Error('A template with that name already exists');

  const w = await db.get('workouts', Number(workoutId));
  if (!w) throw new Error('Workout not found');
  if (w.exercises.length === 0) throw new Error('Workout has no exercises');

  const exercises = w.exercises.map((we) => {
    const workingSets = we.sets.filter((s) => !s.is_warmup);
    const lastSet = workingSets[workingSets.length - 1];
    return {
      exercise_id: we.exercise_id,
      exercise_name: we.exercise_name,
      category: we.category,
      equipment: we.equipment,
      target_sets: workingSets.length || 3,
      target_reps: lastSet?.reps ? String(lastSet.reps) : '8-12',
      target_weight: lastSet?.weight ?? null,
    };
  });

  const record = {
    name: name.trim(),
    description: 'Saved from workout',
    created_at: nowISO(),
    exercises: exercises.map((e, i) => ({ ...e, order_index: i })),
  };
  const id = await db.add('templates', record);
  return { ...record, id };
}

// --------------------------------------------------------------------- Stats

async function getCoverage(days) {
  const windowDays = Math.max(1, Math.min(Number(days) || 7, 365));
  const cutoff = new Date(Date.now() - windowDays * 86400000).toISOString();

  const db = await getDB();
  const exercises = await db.getAll('exercises');
  const musclesByExerciseId = new Map(exercises.map((e) => [e.id, e.muscles]));

  const workouts = await db.getAllFromIndex('workouts', 'started_at', IDBKeyRange.lowerBound(cutoff));

  const totals = new Map(MUSCLE_GROUPS.map((m) => [m.name, 0]));
  for (const w of workouts) {
    for (const we of w.exercises) {
      const muscles = musclesByExerciseId.get(we.exercise_id) || [];
      const workingSetCount = we.sets.filter((s) => !s.is_warmup).length;
      if (workingSetCount === 0) continue;
      for (const m of muscles) {
        const weight = m.role === 'primary' ? 1 : 0.5;
        totals.set(m.muscle, (totals.get(m.muscle) || 0) + weight * workingSetCount);
      }
    }
  }

  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0);
  const coverage = MUSCLE_GROUPS.map((m) => {
    const volume = totals.get(m.name) || 0;
    return {
      muscle: m.name,
      front_or_back: m.front_or_back,
      volume,
      percentage: grandTotal > 0 ? Math.round((volume / grandTotal) * 1000) / 10 : 0,
    };
  }).sort((a, b) => b.volume - a.volume);

  return { days: windowDays, total_weighted_sets: grandTotal, coverage };
}

export const api = {
  listExercises,
  getExercise,
  createExercise,
  deleteExercise,
  lastPerformance,
  exerciseHistory,
  listMuscleGroups,
  listWorkouts,
  getWorkout,
  startWorkout,
  updateWorkout,
  completeWorkout,
  deleteWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  updateSet,
  deleteSet,
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  saveTemplateFromWorkout,
  getCoverage,
};
