import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import ExercisePicker from './ExercisePicker.jsx';
import { GOAL_OPTIONS, EXPERIENCE_OPTIONS, DAY_NAMES } from '../lib/constants.js';

function IntakeForm({ onGenerated }) {
  const [goal, setGoal] = useState('hypertrophy');
  const [experience, setExperience] = useState('beginner');
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const preview = await api.generateRoutine({
        goal,
        experience_level: experience,
        days_per_week: days,
      });
      onGenerated(preview);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-lg font-bold text-slate-900">Build a routine</h2>
      <div>
        <label className="label">Goal</label>
        <select className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>
          {GOAL_OPTIONS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Experience level</label>
        <select className="input" value={experience} onChange={(e) => setExperience(e.target.value)}>
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Days per week available</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <button
              key={d}
              className={`chip shrink-0 border px-3 py-1.5 ${days === d ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'}`}
              onClick={() => setDays(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <button className="btn-primary w-full" onClick={generate} disabled={loading}>
        {loading ? 'Generating…' : 'Generate suggested routine'}
      </button>
    </div>
  );
}

function DayEditor({ day, onChange, onAddExercise }) {
  function updateExercise(idx, patch) {
    const exercises = day.exercises.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex));
    onChange({ ...day, exercises });
  }
  function removeExercise(idx) {
    onChange({ ...day, exercises: day.exercises.filter((_, i) => i !== idx) });
  }

  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{DAY_NAMES[day.day_index]}</p>
          <input
            className="border-none bg-transparent p-0 font-semibold text-slate-900 focus:outline-none"
            value={day.label}
            onChange={(e) => onChange({ ...day, label: e.target.value })}
          />
        </div>
        <button className="btn-ghost !px-2 !py-1" onClick={onAddExercise}>
          + Exercise
        </button>
      </div>
      {day.exercises.length === 0 ? (
        <p className="text-sm text-slate-400">Rest day</p>
      ) : (
        <ul className="space-y-1.5">
          {day.exercises.map((ex, idx) => (
            <li key={`${ex.exercise_id}-${idx}`} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
              <span className="flex-1 text-sm font-medium text-slate-800">{ex.name}</span>
              <input
                className="w-12 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-center text-xs"
                value={ex.target_sets}
                onChange={(e) => updateExercise(idx, { target_sets: Number(e.target.value) || 0 })}
                title="Target sets"
              />
              <span className="text-xs text-slate-400">×</span>
              <input
                className="w-16 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-center text-xs"
                value={ex.target_reps}
                onChange={(e) => updateExercise(idx, { target_reps: e.target.value })}
                title="Target reps"
              />
              <button className="text-slate-300 hover:text-red-500" onClick={() => removeExercise(idx)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RoutineList({ routines, onChanged }) {
  async function activate(id) {
    await api.activateRoutine(id);
    onChanged();
  }
  async function remove(id) {
    if (!confirm('Delete this routine?')) return;
    await api.deleteRoutine(id);
    onChanged();
  }

  if (routines.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Saved routines</h3>
      {routines.map((r) => (
        <div key={r.id} className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-slate-900">
                {r.name} {r.is_active ? <span className="chip bg-green-100 text-green-700">active</span> : null}
              </p>
              <p className="text-xs text-slate-400">
                {r.days_per_week} days/week · {r.goal.replace('_', ' ')} · {r.experience_level}
              </p>
            </div>
            <div className="flex gap-1">
              {!r.is_active && (
                <button className="btn-ghost !px-2 !py-1" onClick={() => activate(r.id)}>
                  Activate
                </button>
              )}
              <button className="btn-ghost !px-2 !py-1 text-red-500" onClick={() => remove(r.id)}>
                Delete
              </button>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
            {r.days
              .filter((d) => d.exercises.length > 0)
              .map((d) => (
                <div key={d.id}>
                  <span className="font-medium">{DAY_NAMES[d.day_index]}:</span> {d.label} ({d.exercises.length}{' '}
                  exercises)
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RoutineBuilder() {
  const [preview, setPreview] = useState(null);
  const [routineName, setRoutineName] = useState('');
  const [pickerDayIndex, setPickerDayIndex] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function refreshRoutines() {
    api.listRoutines().then(setRoutines);
  }
  useEffect(refreshRoutines, []);

  function updateDay(idx, updatedDay) {
    setPreview((p) => ({ ...p, days: p.days.map((d, i) => (i === idx ? updatedDay : d)) }));
  }

  function addExerciseToDay(exercise) {
    setPreview((p) => ({
      ...p,
      days: p.days.map((d, i) =>
        i === pickerDayIndex
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                { exercise_id: exercise.id, name: exercise.name, target_sets: 3, target_reps: '8-12' },
              ],
            }
          : d
      ),
    }));
    setPickerDayIndex(null);
  }

  async function saveRoutine() {
    setError('');
    if (!routineName.trim()) return setError('Give this routine a name.');
    setSaving(true);
    try {
      await api.saveRoutine({
        name: routineName.trim(),
        goal: preview.goal,
        experience_level: preview.experience_level,
        days_per_week: preview.days_per_week,
        days: preview.days,
      });
      setPreview(null);
      setRoutineName('');
      refreshRoutines();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <IntakeForm
        onGenerated={(p) => {
          setPreview(p);
          setRoutineName('');
        }}
      />

      {preview && (
        <div className="space-y-3">
          <div className="card space-y-2">
            <p className="text-sm text-slate-600">
              Suggested split: <strong>{preview.days_per_week} days/week</strong>,{' '}
              {preview.scheme.sets} sets × {preview.scheme.reps} reps per exercise.
            </p>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <input
              className="input"
              placeholder='Name this routine, e.g. "Fall Bulk"'
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
            />
            <button className="btn-primary w-full" onClick={saveRoutine} disabled={saving}>
              {saving ? 'Saving…' : 'Save routine'}
            </button>
          </div>

          {preview.days.map((day, idx) => (
            <DayEditor
              key={day.day_index}
              day={day}
              onChange={(d) => updateDay(idx, d)}
              onAddExercise={() => setPickerDayIndex(idx)}
            />
          ))}
        </div>
      )}

      <RoutineList routines={routines} onChanged={refreshRoutines} />

      {pickerDayIndex !== null && (
        <ExercisePicker onPick={addExerciseToDay} onClose={() => setPickerDayIndex(null)} />
      )}
    </div>
  );
}
