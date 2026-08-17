import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

function SetRow({ set, onUpdate, onDelete }) {
  const [reps, setReps] = useState(set.reps ?? '');
  const [weight, setWeight] = useState(set.weight ?? '');

  useEffect(() => setReps(set.reps ?? ''), [set.id, set.reps]);
  useEffect(() => setWeight(set.weight ?? ''), [set.id, set.weight]);

  function commitReps() {
    const val = reps === '' ? null : Number(reps);
    if (val !== (set.reps ?? null)) onUpdate({ reps: val });
  }
  function commitWeight() {
    const val = weight === '' ? null : Number(weight);
    if (val !== (set.weight ?? null)) onUpdate({ weight: val });
  }
  function blurOnEnter(e) {
    if (e.key === 'Enter') e.target.blur();
  }

  return (
    <tr className="border-t border-neutral-800">
      <td className="py-1.5 pr-2 font-mono text-neutral-500">{set.set_number}</td>
      <td className="py-1.5 pr-2">
        <input
          type="number"
          inputMode="numeric"
          className="input !py-1.5 text-center"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={commitReps}
          onKeyDown={blurOnEnter}
        />
      </td>
      <td className="py-1.5 pr-2">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            className="input !py-1.5 text-center"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={commitWeight}
            onKeyDown={blurOnEnter}
          />
          <span className="w-6 shrink-0 text-xs text-neutral-500">{weight !== '' ? set.weight_unit : ''}</span>
        </div>
      </td>
      <td className="py-1.5 text-right">
        <button className="text-neutral-600 hover:text-red-400" onClick={onDelete}>
          ✕
        </button>
      </td>
    </tr>
  );
}

export default function ExerciseCard({ workoutId, we, onWorkoutUpdate, onRemove }) {
  const [lastSets, setLastSets] = useState(null);
  const [unit, setUnit] = useState('lb');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.lastPerformance(we.exercise_id).then((res) => {
      setLastSets(res.sets);
      if (res.sets[0]?.weight_unit) setUnit(res.sets[0].weight_unit);
    });
  }, [we.exercise_id]);

  async function addSet() {
    setAdding(true);
    try {
      const previous = we.sets[we.sets.length - 1];
      const fallback = lastSets?.[0];
      const source = previous || fallback;
      const payload = {
        reps: source?.reps ?? null,
        weight: source?.weight ?? null,
        weight_unit: source?.weight_unit ?? unit,
      };
      const res = await api.addSet(workoutId, we.id, payload);
      onWorkoutUpdate(res.workout);
    } finally {
      setAdding(false);
    }
  }

  async function updateSet(setId, patch) {
    const workout = await api.updateSet(workoutId, setId, patch);
    onWorkoutUpdate(workout);
  }

  async function deleteSet(setId) {
    const workout = await api.deleteSet(workoutId, setId);
    onWorkoutUpdate(workout);
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-neutral-50">{we.exercise_name}</p>
          <p className="text-xs uppercase tracking-wide text-neutral-500">{we.category?.replace('_', ' ')}</p>
        </div>
        <button className="btn-ghost !px-2 !py-1 text-red-400" onClick={onRemove}>
          Remove
        </button>
      </div>

      {we.sets.length > 0 ? (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-neutral-500">
              <th className="w-8 pb-1">Set</th>
              <th className="pb-1">Reps</th>
              <th className="pb-1">Weight</th>
              <th className="w-8 pb-1" />
            </tr>
          </thead>
          <tbody>
            {we.sets.map((s) => (
              <SetRow key={s.id} set={s} onUpdate={(patch) => updateSet(s.id, patch)} onDelete={() => deleteSet(s.id)} />
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">No sets yet.</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button className="btn-primary flex-1" onClick={addSet} disabled={adding}>
          + Add set
        </button>
        <select className="input w-16 shrink-0" value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="lb">lb</option>
          <option value="kg">kg</option>
        </select>
      </div>
    </div>
  );
}
