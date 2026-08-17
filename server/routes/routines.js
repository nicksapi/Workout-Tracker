import { Router } from 'express';
import { db } from '../db.js';
import { generateRoutine } from '../routineEngine.js';

const router = Router();

function getFullRoutine(routineId) {
  const routine = db.prepare('SELECT * FROM routines WHERE id = ?').get(routineId);
  if (!routine) return null;
  const days = db
    .prepare(
      `SELECT rd.*, t.name AS template_name FROM routine_days rd
       LEFT JOIN templates t ON t.id = rd.template_id
       WHERE rd.routine_id = ? ORDER BY rd.day_index ASC`
    )
    .all(routineId);
  const templateExStmt = db.prepare(
    `SELECT te.*, e.name AS exercise_name FROM template_exercises te
     JOIN exercises e ON e.id = te.exercise_id WHERE te.template_id = ? ORDER BY te.order_index ASC`
  );
  const fullDays = days.map((d) => ({
    ...d,
    exercises: d.template_id ? templateExStmt.all(d.template_id) : [],
  }));
  return { ...routine, days: fullDays };
}

router.get('/', (req, res) => {
  const routines = db.prepare('SELECT * FROM routines ORDER BY created_at DESC').all();
  res.json(routines.map((r) => getFullRoutine(r.id)));
});

router.get('/:id', (req, res) => {
  const routine = getFullRoutine(req.params.id);
  if (!routine) return res.status(404).json({ error: 'Routine not found' });
  res.json(routine);
});

// POST /api/routines/generate { goal, experience_level, days_per_week }
// Preview only — does not persist anything.
router.post('/generate', (req, res) => {
  const { goal = 'general_fitness', experience_level = 'beginner', days_per_week = 3 } = req.body || {};
  const preview = generateRoutine(db, { goal, experienceLevel: experience_level, daysPerWeek: days_per_week });
  res.json(preview);
});

// POST /api/routines { name, goal, experience_level, days_per_week, days: [{day_index, label, exercises:[{exercise_id, target_sets, target_reps}]}] }
router.post('/', (req, res) => {
  const { name, goal = 'general_fitness', experience_level = 'beginner', days_per_week = 3, days = [] } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  const insertRoutine = db.prepare(
    'INSERT INTO routines (name, goal, experience_level, days_per_week) VALUES (?, ?, ?, ?)'
  );
  const insertTemplate = db.prepare('INSERT INTO templates (name, description) VALUES (?, ?)');
  const insertTE = db.prepare(
    'INSERT INTO template_exercises (template_id, exercise_id, order_index, target_sets, target_reps, target_weight) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertDay = db.prepare(
    'INSERT INTO routine_days (routine_id, day_index, label, template_id) VALUES (?, ?, ?, ?)'
  );

  const tx = db.transaction(() => {
    const routineInfo = insertRoutine.run(name.trim(), goal, experience_level, days_per_week);
    const routineId = routineInfo.lastInsertRowid;

    for (const day of days) {
      let templateId = null;
      if (Array.isArray(day.exercises) && day.exercises.length > 0) {
        const templateName = `${name.trim()} — ${day.label}`;
        const existingTemplate = db.prepare('SELECT id FROM templates WHERE name = ?').get(templateName);
        if (existingTemplate) {
          templateId = existingTemplate.id;
        } else {
          const tInfo = insertTemplate.run(templateName, `Auto-generated for routine "${name.trim()}"`);
          templateId = tInfo.lastInsertRowid;
          day.exercises.forEach((ex, i) => {
            insertTE.run(templateId, ex.exercise_id, i, ex.target_sets ?? 3, ex.target_reps ?? '8-12', null);
          });
        }
      }
      insertDay.run(routineId, day.day_index, day.label, templateId);
    }
    return routineId;
  });

  const id = tx();
  res.status(201).json(getFullRoutine(id));
});

router.post('/:id/activate', (req, res) => {
  const routine = db.prepare('SELECT * FROM routines WHERE id = ?').get(req.params.id);
  if (!routine) return res.status(404).json({ error: 'Routine not found' });
  const tx = db.transaction(() => {
    db.prepare('UPDATE routines SET is_active = 0').run();
    db.prepare('UPDATE routines SET is_active = 1 WHERE id = ?').run(req.params.id);
  });
  tx();
  res.json(getFullRoutine(req.params.id));
});

router.delete('/:id', (req, res) => {
  const routine = db.prepare('SELECT * FROM routines WHERE id = ?').get(req.params.id);
  if (!routine) return res.status(404).json({ error: 'Routine not found' });
  db.prepare('DELETE FROM routines WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
