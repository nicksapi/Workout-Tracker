import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import ExercisePicker from './ExercisePicker.jsx';
import ExerciseCard from './ExerciseCard.jsx';

const ACTIVE_WORKOUT_KEY = 'workout-tracker:active-workout-id';

function StartScreen({ onStarted }) {
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.listTemplates().then(setTemplates);
  }, []);

  async function start(templateId, templateName) {
    setStarting(true);
    try {
      const workout = await api.startWorkout({
        name: templateName || name.trim() || 'Workout',
        template_id: templateId ?? null,
      });
      localStorage.setItem(ACTIVE_WORKOUT_KEY, String(workout.id));
      onStarted(workout);
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Start a workout</h2>
        <input
          className="input"
          placeholder="Workout name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn-primary w-full" disabled={starting} onClick={() => start(null, null)}>
          Start blank workout
        </button>
      </div>

      {templates.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your templates</h3>
          {templates.map((t) => (
            <button
              key={t.id}
              disabled={starting}
              onClick={() => start(t.id, t.name)}
              className="card flex w-full items-center justify-between text-left hover:border-brand-300"
            >
              <span>
                <span className="block font-medium text-slate-900">{t.name}</span>
                <span className="block text-xs text-slate-400">{t.exercises.length} exercises</span>
              </span>
              <span className="text-brand-600">Load →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SaveTemplateModal({ workoutId, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required.');
    setSaving(true);
    setError('');
    try {
      await api.saveTemplateFromWorkout(workoutId, name.trim());
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-slate-900">Save as template</h3>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <input
          autoFocus
          className="input"
          placeholder='e.g. "Push Day A"'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function WorkoutLogger() {
  const [workout, setWorkout] = useState(undefined); // undefined = loading, null = none active
  const [showPicker, setShowPicker] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => {
    const id = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!id) {
      setWorkout(null);
      return;
    }
    api
      .getWorkout(id)
      .then((w) => {
        if (w.completed_at) {
          localStorage.removeItem(ACTIVE_WORKOUT_KEY);
          setWorkout(null);
        } else {
          setWorkout(w);
          setNameDraft(w.name);
        }
      })
      .catch(() => {
        localStorage.removeItem(ACTIVE_WORKOUT_KEY);
        setWorkout(null);
      });
  }, []);

  function handleStarted(w) {
    setWorkout(w);
    setNameDraft(w.name);
  }

  async function addExercise(exercise) {
    const updated = await api.addExerciseToWorkout(workout.id, exercise.id);
    setWorkout(updated);
    setShowPicker(false);
  }

  async function removeExercise(weId) {
    const updated = await api.removeExerciseFromWorkout(workout.id, weId);
    setWorkout(updated);
  }

  async function saveName() {
    if (nameDraft.trim() && nameDraft !== workout.name) {
      const updated = await api.updateWorkout(workout.id, { name: nameDraft.trim() });
      setWorkout(updated);
    }
  }

  async function finishWorkout() {
    if (!confirm('Finish this workout? You can still view it in History.')) return;
    await api.completeWorkout(workout.id);
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    setWorkout(null);
  }

  async function discardWorkout() {
    if (!confirm('Discard this workout and delete everything logged in it?')) return;
    await api.deleteWorkout(workout.id);
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    setWorkout(null);
  }

  if (workout === undefined) {
    return <p className="py-8 text-center text-sm text-slate-400">Loading…</p>;
  }

  if (workout === null) {
    return <StartScreen onStarted={handleStarted} />;
  }

  const totalSets = workout.exercises.reduce((sum, we) => sum + we.sets.length, 0);

  return (
    <div className="space-y-4 pb-4">
      <div className="card space-y-2">
        <input
          className="w-full border-none bg-transparent p-0 text-lg font-bold text-slate-900 focus:outline-none"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={saveName}
        />
        <p className="text-xs text-slate-400">
          Started {new Date(workout.started_at).toLocaleString()} · {workout.exercises.length} exercises ·{' '}
          {totalSets} sets
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button className="btn-primary" onClick={() => setShowPicker(true)}>
            + Add exercise
          </button>
          {workout.exercises.length > 0 && (
            <button className="btn-secondary" onClick={() => setShowSaveTemplate(true)}>
              Save as template
            </button>
          )}
          <button className="btn-secondary" onClick={finishWorkout}>
            Finish workout
          </button>
          <button className="btn-danger" onClick={discardWorkout}>
            Discard
          </button>
        </div>
      </div>

      {workout.exercises.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No exercises yet. Tap "Add exercise" to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {workout.exercises.map((we) => (
            <ExerciseCard
              key={we.id}
              workoutId={workout.id}
              we={we}
              onWorkoutUpdate={setWorkout}
              onRemove={() => removeExercise(we.id)}
            />
          ))}
        </div>
      )}

      {showPicker && <ExercisePicker onPick={addExercise} onClose={() => setShowPicker(false)} />}
      {showSaveTemplate && (
        <SaveTemplateModal
          workoutId={workout.id}
          onClose={() => setShowSaveTemplate(false)}
          onSaved={() => setShowSaveTemplate(false)}
        />
      )}
    </div>
  );
}
