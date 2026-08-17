import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function attachMuscles(exercises) {
  if (exercises.length === 0) return exercises;
  const ids = exercises.map((e) => e.id);
  const placeholders = ids.map(() => '?').join(',');
  const links = db
    .prepare(
      `SELECT em.exercise_id, mg.name AS muscle, em.role
       FROM exercise_muscles em JOIN muscle_groups mg ON mg.id = em.muscle_group_id
       WHERE em.exercise_id IN (${placeholders})`
    )
    .all(...ids);
  const byExercise = new Map();
  for (const link of links) {
    if (!byExercise.has(link.exercise_id)) byExercise.set(link.exercise_id, []);
    byExercise.get(link.exercise_id).push({ muscle: link.muscle, role: link.role });
  }
  return exercises.map((e) => ({ ...e, muscles: byExercise.get(e.id) || [] }));
}

// GET /api/exercises?search=&category=&muscle=
router.get('/', (req, res) => {
  const { search = '', category = '', muscle = '' } = req.query;
  let sql = 'SELECT DISTINCT e.* FROM exercises e';
  const where = [];
  const params = [];
  if (muscle) {
    sql += ' JOIN exercise_muscles em ON em.exercise_id = e.id JOIN muscle_groups mg ON mg.id = em.muscle_group_id';
    where.push('mg.name = ?');
    params.push(muscle);
  }
  if (search) {
    where.push('e.name LIKE ?');
    params.push(`%${search}%`);
  }
  if (category) {
    where.push('e.category = ?');
    params.push(category);
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY e.name ASC';
  const rows = db.prepare(sql).all(...params);
  res.json(attachMuscles(rows));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Exercise not found' });
  res.json(attachMuscles([row])[0]);
});

// POST /api/exercises  { name, category, equipment, muscles: [{muscle, role}] }
router.post('/', (req, res) => {
  const { name, category = 'full_body', equipment = 'bodyweight', muscles = [] } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  if (!Array.isArray(muscles) || muscles.length === 0) {
    return res.status(400).json({ error: 'at least one muscle tag is required' });
  }

  const existing = db.prepare('SELECT id FROM exercises WHERE name = ?').get(name.trim());
  if (existing) return res.status(409).json({ error: 'An exercise with that name already exists' });

  const muscleRows = db.prepare('SELECT id, name FROM muscle_groups').all();
  const muscleIdByName = new Map(muscleRows.map((m) => [m.name, m.id]));
  for (const m of muscles) {
    if (!muscleIdByName.has(m.muscle)) {
      return res.status(400).json({ error: `Unknown muscle group: ${m.muscle}` });
    }
  }

  const insertExercise = db.prepare(
    'INSERT INTO exercises (name, category, equipment, is_custom) VALUES (?, ?, ?, 1)'
  );
  const insertLink = db.prepare(
    'INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (?, ?, ?)'
  );
  const tx = db.transaction(() => {
    const info = insertExercise.run(name.trim(), category, equipment);
    for (const m of muscles) {
      insertLink.run(info.lastInsertRowid, muscleIdByName.get(m.muscle), m.role === 'secondary' ? 'secondary' : 'primary');
    }
    return info.lastInsertRowid;
  });
  const id = tx();
  const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get(id);
  res.status(201).json(attachMuscles([row])[0]);
});

router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Exercise not found' });
  if (!row.is_custom) return res.status(400).json({ error: 'Only custom exercises can be deleted' });
  db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// GET /api/exercises/:id/last  -> last logged sets for prefill
router.get('/:id/last', (req, res) => {
  const lastWorkoutExercise = db
    .prepare(
      `SELECT we.id FROM workout_exercises we
       JOIN workouts w ON w.id = we.workout_id
       WHERE we.exercise_id = ?
       ORDER BY w.started_at DESC, we.id DESC
       LIMIT 1`
    )
    .get(req.params.id);
  if (!lastWorkoutExercise) return res.json({ sets: [] });
  const sets = db
    .prepare('SELECT set_number, reps, weight, weight_unit, rpe, is_warmup FROM sets WHERE workout_exercise_id = ? ORDER BY set_number ASC')
    .all(lastWorkoutExercise.id);
  res.json({ sets });
});

// GET /api/exercises/:id/history -> progress trend (best set weight per workout date)
router.get('/:id/history', (req, res) => {
  const rows = db
    .prepare(
      `SELECT w.id AS workout_id, w.started_at, MAX(s.weight) AS max_weight,
              SUM(s.reps * COALESCE(s.weight, 0)) AS volume
       FROM sets s
       JOIN workout_exercises we ON we.id = s.workout_exercise_id
       JOIN workouts w ON w.id = we.workout_id
       WHERE we.exercise_id = ? AND s.is_warmup = 0
       GROUP BY w.id
       ORDER BY w.started_at ASC`
    )
    .all(req.params.id);
  res.json(rows);
});

export default router;
