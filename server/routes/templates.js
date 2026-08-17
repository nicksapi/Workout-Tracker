import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function getFullTemplate(templateId) {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
  if (!template) return null;
  const exercises = db
    .prepare(
      `SELECT te.*, e.name AS exercise_name, e.category, e.equipment
       FROM template_exercises te JOIN exercises e ON e.id = te.exercise_id
       WHERE te.template_id = ? ORDER BY te.order_index ASC`
    )
    .all(templateId);
  return { ...template, exercises };
}

router.get('/', (req, res) => {
  const templates = db.prepare('SELECT * FROM templates ORDER BY name ASC').all();
  res.json(templates.map((t) => getFullTemplate(t.id)));
});

router.get('/:id', (req, res) => {
  const template = getFullTemplate(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

// POST /api/templates { name, description, exercises: [{exercise_id, target_sets, target_reps, target_weight}] }
router.post('/', (req, res) => {
  const { name, description = '', exercises = [] } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const existing = db.prepare('SELECT id FROM templates WHERE name = ?').get(name.trim());
  if (existing) return res.status(409).json({ error: 'A template with that name already exists' });

  const insertTemplate = db.prepare('INSERT INTO templates (name, description) VALUES (?, ?)');
  const insertTE = db.prepare(
    'INSERT INTO template_exercises (template_id, exercise_id, order_index, target_sets, target_reps, target_weight) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const tx = db.transaction(() => {
    const info = insertTemplate.run(name.trim(), description);
    exercises.forEach((ex, i) => {
      insertTE.run(
        info.lastInsertRowid,
        ex.exercise_id,
        i,
        ex.target_sets ?? 3,
        ex.target_reps ?? '8-12',
        ex.target_weight ?? null
      );
    });
    return info.lastInsertRowid;
  });
  const id = tx();
  res.status(201).json(getFullTemplate(id));
});

router.put('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  const { name, description, exercises } = req.body || {};

  const tx = db.transaction(() => {
    db.prepare('UPDATE templates SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?').run(
      name ?? null,
      description ?? null,
      req.params.id
    );
    if (Array.isArray(exercises)) {
      db.prepare('DELETE FROM template_exercises WHERE template_id = ?').run(req.params.id);
      const insertTE = db.prepare(
        'INSERT INTO template_exercises (template_id, exercise_id, order_index, target_sets, target_reps, target_weight) VALUES (?, ?, ?, ?, ?, ?)'
      );
      exercises.forEach((ex, i) => {
        insertTE.run(req.params.id, ex.exercise_id, i, ex.target_sets ?? 3, ex.target_reps ?? '8-12', ex.target_weight ?? null);
      });
    }
  });
  tx();
  res.json(getFullTemplate(req.params.id));
});

router.delete('/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// Save an existing (in-progress or completed) workout's exercises as a new template.
router.post('/from-workout/:workoutId', (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const existing = db.prepare('SELECT id FROM templates WHERE name = ?').get(name.trim());
  if (existing) return res.status(409).json({ error: 'A template with that name already exists' });

  const workoutExercises = db
    .prepare('SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY order_index ASC')
    .all(req.params.workoutId);
  if (workoutExercises.length === 0) return res.status(400).json({ error: 'Workout has no exercises' });

  const insertTemplate = db.prepare('INSERT INTO templates (name, description) VALUES (?, ?)');
  const insertTE = db.prepare(
    'INSERT INTO template_exercises (template_id, exercise_id, order_index, target_sets, target_reps, target_weight) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const setsStmt = db.prepare('SELECT * FROM sets WHERE workout_exercise_id = ? AND is_warmup = 0');

  const tx = db.transaction(() => {
    const info = insertTemplate.run(name.trim(), 'Saved from workout');
    workoutExercises.forEach((we, i) => {
      const sets = setsStmt.all(we.id);
      const targetSets = sets.length || 3;
      const lastSet = sets[sets.length - 1];
      insertTE.run(
        info.lastInsertRowid,
        we.exercise_id,
        i,
        targetSets,
        lastSet?.reps ? String(lastSet.reps) : '8-12',
        lastSet?.weight ?? null
      );
    });
    return info.lastInsertRowid;
  });
  const id = tx();
  res.status(201).json(getFullTemplate(id));
});

export default router;
