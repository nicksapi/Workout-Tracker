import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/stats/coverage?days=7  -> per-muscle-group set volume + percentage share
router.get('/coverage', (req, res) => {
  const days = Math.max(1, Math.min(Number(req.query.days) || 7, 365));

  const rows = db
    .prepare(
      `SELECT em.muscle_group_id, em.role
       FROM sets s
       JOIN workout_exercises we ON we.id = s.workout_exercise_id
       JOIN workouts w ON w.id = we.workout_id
       JOIN exercise_muscles em ON em.exercise_id = we.exercise_id
       WHERE s.is_warmup = 0 AND w.started_at >= datetime('now', ?)`
    )
    .all(`-${days} days`);

  const muscleGroups = db.prepare('SELECT * FROM muscle_groups ORDER BY name ASC').all();
  const totals = new Map(muscleGroups.map((m) => [m.id, 0]));
  for (const r of rows) {
    totals.set(r.muscle_group_id, (totals.get(r.muscle_group_id) || 0) + (r.role === 'primary' ? 1 : 0.5));
  }
  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0);

  const coverage = muscleGroups
    .map((m) => {
      const volume = totals.get(m.id) || 0;
      return {
        muscle: m.name,
        front_or_back: m.front_or_back,
        volume,
        percentage: grandTotal > 0 ? Math.round((volume / grandTotal) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.volume - a.volume);

  res.json({ days, total_weighted_sets: grandTotal, coverage });
});

export default router;
