import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function getFullWorkout(workoutId) {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
  if (!workout) return null;
  const workoutExercises = db
    .prepare(
      `SELECT we.id, we.exercise_id, we.order_index, e.name AS exercise_name, e.category, e.equipment
       FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id
       WHERE we.workout_id = ? ORDER BY we.order_index ASC, we.id ASC`
    )
    .all(workoutId);
  const setsStmt = db.prepare('SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number ASC');
  const exercises = workoutExercises.map((we) => ({ ...we, sets: setsStmt.all(we.id) }));
  return { ...workout, exercises };
}

// GET /api/workouts?limit=20  -> history list (summary)
router.get('/', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const workouts = db
    .prepare('SELECT * FROM workouts ORDER BY started_at DESC LIMIT ?')
    .all(limit);
  const summaries = workouts.map((w) => {
    const stats = db
      .prepare(
        `SELECT COUNT(DISTINCT we.id) AS exercise_count, COUNT(s.id) AS set_count
         FROM workout_exercises we LEFT JOIN sets s ON s.workout_exercise_id = we.id
         WHERE we.workout_id = ?`
      )
      .get(w.id);
    return { ...w, ...stats };
  });
  res.json(summaries);
});

router.get('/:id', (req, res) => {
  const workout = getFullWorkout(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  res.json(workout);
});

// POST /api/workouts  { name, template_id }
router.post('/', (req, res) => {
  const { name = 'Workout', template_id = null } = req.body || {};
  const info = db
    .prepare('INSERT INTO workouts (name, template_id) VALUES (?, ?)')
    .run(name, template_id);
  const workoutId = info.lastInsertRowid;

  if (template_id) {
    const templateExercises = db
      .prepare('SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index ASC')
      .all(template_id);
    const insertWE = db.prepare(
      'INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES (?, ?, ?)'
    );
    for (const te of templateExercises) {
      insertWE.run(workoutId, te.exercise_id, te.order_index);
    }
  }

  res.status(201).json(getFullWorkout(workoutId));
});

router.put('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  const { name, notes, completed_at } = req.body || {};
  db.prepare(
    'UPDATE workouts SET name = COALESCE(?, name), notes = COALESCE(?, notes), completed_at = COALESCE(?, completed_at) WHERE id = ?'
  ).run(name ?? null, notes ?? null, completed_at ?? null, req.params.id);
  res.json(getFullWorkout(req.params.id));
});

router.post('/:id/complete', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  db.prepare("UPDATE workouts SET completed_at = datetime('now') WHERE id = ?").run(req.params.id);
  res.json(getFullWorkout(req.params.id));
});

router.delete('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// POST /api/workouts/:id/exercises  { exercise_id }
router.post('/:id/exercises', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  const { exercise_id } = req.body || {};
  const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(exercise_id);
  if (!exercise) return res.status(400).json({ error: 'Invalid exercise_id' });

  const { maxOrder } = db
    .prepare('SELECT MAX(order_index) AS maxOrder FROM workout_exercises WHERE workout_id = ?')
    .get(req.params.id);
  const info = db
    .prepare('INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES (?, ?, ?)')
    .run(req.params.id, exercise_id, (maxOrder ?? -1) + 1);

  res.status(201).json(getFullWorkout(req.params.id));
  void info;
});

router.delete('/:workoutId/exercises/:weId', (req, res) => {
  const we = db.prepare('SELECT * FROM workout_exercises WHERE id = ? AND workout_id = ?').get(req.params.weId, req.params.workoutId);
  if (!we) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM workout_exercises WHERE id = ?').run(req.params.weId);
  res.json(getFullWorkout(req.params.workoutId));
});

// POST /api/workouts/:workoutId/exercises/:weId/sets  { reps, weight, weight_unit, rpe, is_warmup }
router.post('/:workoutId/exercises/:weId/sets', (req, res) => {
  const we = db.prepare('SELECT * FROM workout_exercises WHERE id = ? AND workout_id = ?').get(req.params.weId, req.params.workoutId);
  if (!we) return res.status(404).json({ error: 'Not found' });
  const { reps = null, weight = null, weight_unit = 'lb', rpe = null, is_warmup = 0 } = req.body || {};
  const { maxSetNumber } = db
    .prepare('SELECT MAX(set_number) AS maxSetNumber FROM sets WHERE workout_exercise_id = ?')
    .get(req.params.weId);
  const setNumber = (maxSetNumber ?? 0) + 1;
  const info = db
    .prepare(
      'INSERT INTO sets (workout_exercise_id, set_number, reps, weight, weight_unit, rpe, is_warmup) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(req.params.weId, setNumber, reps, weight, weight_unit, rpe, is_warmup ? 1 : 0);
  res.status(201).json({ id: info.lastInsertRowid, workout: getFullWorkout(req.params.workoutId) });
});

router.put('/:workoutId/sets/:setId', (req, res) => {
  const set = db
    .prepare(
      `SELECT s.* FROM sets s JOIN workout_exercises we ON we.id = s.workout_exercise_id
       WHERE s.id = ? AND we.workout_id = ?`
    )
    .get(req.params.setId, req.params.workoutId);
  if (!set) return res.status(404).json({ error: 'Not found' });
  const { reps, weight, weight_unit, rpe, is_warmup } = req.body || {};
  db.prepare(
    `UPDATE sets SET reps = COALESCE(?, reps), weight = COALESCE(?, weight),
     weight_unit = COALESCE(?, weight_unit), rpe = COALESCE(?, rpe),
     is_warmup = COALESCE(?, is_warmup) WHERE id = ?`
  ).run(reps ?? null, weight ?? null, weight_unit ?? null, rpe ?? null, is_warmup === undefined ? null : (is_warmup ? 1 : 0), req.params.setId);
  res.json(getFullWorkout(req.params.workoutId));
});

router.delete('/:workoutId/sets/:setId', (req, res) => {
  const set = db
    .prepare(
      `SELECT s.* FROM sets s JOIN workout_exercises we ON we.id = s.workout_exercise_id
       WHERE s.id = ? AND we.workout_id = ?`
    )
    .get(req.params.setId, req.params.workoutId);
  if (!set) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM sets WHERE id = ?').run(req.params.setId);
  res.json(getFullWorkout(req.params.workoutId));
});

export default router;
