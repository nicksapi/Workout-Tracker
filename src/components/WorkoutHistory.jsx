import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import TrendChart from './TrendChart.jsx';

function WorkoutDetail({ workout, onClose, onDeleted }) {
  async function handleDelete() {
    if (!confirm(`Delete "${workout.name}"? This cannot be undone.`)) return;
    await api.deleteWorkout(workout.id);
    onDeleted(workout.id);
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-2xl border border-neutral-800 bg-neutral-900 p-4 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="font-bold text-neutral-50">{workout.name}</h3>
            <p className="text-xs text-neutral-500">{new Date(workout.started_at).toLocaleString()}</p>
          </div>
          <button className="btn-ghost !px-2 !py-1" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {workout.exercises.map((we) => (
            <div key={we.id} className="rounded-lg border border-neutral-800 p-3">
              <p className="font-medium text-neutral-100">{we.exercise_name}</p>
              <ul className="mt-1 space-y-0.5 text-sm text-neutral-400">
                {we.sets.map((s) => (
                  <li key={s.id}>
                    Set {s.set_number}: {s.reps ?? '—'} reps × {s.weight ?? '—'} {s.weight != null ? s.weight_unit : ''}
                    {s.is_warmup ? ' (warmup)' : ''}
                  </li>
                ))}
                {we.sets.length === 0 && <li className="text-neutral-500">No sets logged.</li>}
              </ul>
            </div>
          ))}
          {workout.exercises.length === 0 && <p className="text-sm text-neutral-500">No exercises logged.</p>}
        </div>
        <button className="btn-danger mt-4 w-full" onClick={handleDelete}>
          Delete workout
        </button>
      </div>
    </div>
  );
}

function ProgressSection() {
  const [exercises, setExercises] = useState([]);
  const [exerciseId, setExerciseId] = useState('');
  const [metric, setMetric] = useState('max_weight');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.listExercises().then(setExercises);
  }, []);

  useEffect(() => {
    if (!exerciseId) {
      setHistory([]);
      return;
    }
    api.exerciseHistory(exerciseId).then(setHistory);
  }, [exerciseId]);

  const points = history.map((h) => ({
    value: metric === 'max_weight' ? h.max_weight : h.volume,
    dateLabel: new Date(h.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold text-neutral-50">Progress trends</h3>
      <div className="flex gap-2">
        <select className="input" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
          <option value="">Select an exercise…</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>
      {exerciseId && (
        <>
          <div className="flex gap-2">
            <button
              className={`chip border ${metric === 'max_weight' ? 'border-brand-600 bg-brand-500/15 text-brand-400' : 'border-neutral-700 text-neutral-400'}`}
              onClick={() => setMetric('max_weight')}
            >
              Max weight
            </button>
            <button
              className={`chip border ${metric === 'volume' ? 'border-brand-600 bg-brand-500/15 text-brand-400' : 'border-neutral-700 text-neutral-400'}`}
              onClick={() => setMetric('volume')}
            >
              Volume (reps × weight)
            </button>
          </div>
          <TrendChart points={points} label={metric} />
        </>
      )}
    </div>
  );
}

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  function refresh() {
    setLoading(true);
    api
      .listWorkouts({ limit: 100 })
      .then(setWorkouts)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function openDetail(id) {
    const workout = await api.getWorkout(id);
    setSelected(workout);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutral-50">Workout History</h2>
      <ProgressSection />

      {loading ? (
        <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>
      ) : workouts.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">No workouts logged yet.</p>
      ) : (
        <ul className="space-y-2">
          {workouts.map((w) => (
            <li key={w.id}>
              <button className="card-interactive flex w-full items-center justify-between text-left" onClick={() => openDetail(w.id)}>
                <span>
                  <span className="block font-medium text-neutral-100">
                    {w.name}{' '}
                    {!w.completed_at && <span className="chip bg-amber-500/15 text-amber-400">in progress</span>}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {new Date(w.started_at).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {w.exercise_count} exercises · {w.set_count} sets
                  </span>
                </span>
                <span className="text-neutral-600">→</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <WorkoutDetail
          workout={selected}
          onClose={() => setSelected(null)}
          onDeleted={(id) => {
            setSelected(null);
            setWorkouts((prev) => prev.filter((w) => w.id !== id));
          }}
        />
      )}
    </div>
  );
}
