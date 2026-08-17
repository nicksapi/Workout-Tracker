import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import './db.js';

import exercisesRouter from './routes/exercises.js';
import muscleGroupsRouter from './routes/muscleGroups.js';
import workoutsRouter from './routes/workouts.js';
import templatesRouter from './routes/templates.js';
import routinesRouter from './routes/routines.js';
import statsRouter from './routes/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/exercises', exercisesRouter);
app.use('/api/muscle-groups', muscleGroupsRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/stats', statsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
  void next;
});

const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Workout Tracker API listening on http://localhost:${PORT}`);
  if (fs.existsSync(distDir)) {
    console.log(`Open http://localhost:${PORT} in your browser.`);
  }
});
